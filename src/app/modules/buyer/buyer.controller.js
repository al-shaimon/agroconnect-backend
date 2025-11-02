import FarmerProduct from '../product/farmerProduct.model.js';
import Order from '../order/order.model.js';
import Notification from '../notification/notification.model.js';
import User from '../auth/auth.model.js';
import {
  notifyFarmerNewOrder,
  notifyFarmerOrderCancelled,
} from '../../../utils/notificationHelper.js';

// @desc    Place new order
// @route   POST /api/buyer/orders
// @access  Private (Buyer only)
export const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items',
      });
    }

    // Verify all items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    let farmerId = null;

    for (const item of items) {
      // productId is actually farmerProductId now
      const farmerProduct = await FarmerProduct.findById(item.productId).populate(
        'globalProductId'
      );

      if (!farmerProduct) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      // Handle delivery slot if provided (buyer-selected time slot)
      let slotInfo = null;
      if (item.deliverySlot) {
        // Buyer provides: { date, timeSlot: { start, end } }
        slotInfo = {
          date: item.deliverySlot.date,
          timeSlot: item.deliverySlot.timeSlot,
        };
      }

      if (!farmerProduct.isAvailable || farmerProduct.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${
            farmerProduct.globalProductId?.name || 'Unknown'
          } is not available in the requested quantity`,
        });
      }

      // All items must be from the same farmer
      if (farmerId === null) {
        farmerId = farmerProduct.farmerId;
      } else if (farmerId.toString() !== farmerProduct.farmerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'All items in an order must be from the same farmer',
        });
      }

      const subtotal = farmerProduct.price * item.quantity;
      totalAmount += subtotal;

      const orderItem = {
        productId: farmerProduct._id, // Store farmerProductId
        productName: farmerProduct.globalProductId?.name || 'Unknown Product',
        quantity: item.quantity,
        pricePerUnit: farmerProduct.price,
        subtotal,
      };

      // Add slot info if available
      if (slotInfo) {
        orderItem.deliverySlot = slotInfo;
      }

      orderItems.push(orderItem);

      // Reduce product quantity
      farmerProduct.availableQuantity -= item.quantity;
      if (farmerProduct.availableQuantity === 0) {
        farmerProduct.isAvailable = false;
      }
      await farmerProduct.save();
    }

    // Create order
    const order = await Order.create({
      buyerId: req.user._id,
      farmerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      notes,
    });

    // Populate order for notification
    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name email')
      .populate('farmerId', 'name email');

    // Get Socket.IO instance and connected users
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Send comprehensive notification to farmer (in-app + push + email)
    await notifyFarmerNewOrder(
      farmerId,
      {
        orderId: populatedOrder._id,
        buyerName: populatedOrder.buyerId.name,
        items: orderItems,
        totalAmount,
        deliveryAddress,
      },
      io,
      connectedUsers
    ).catch((err) => console.error('Error sending farmer notification:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get buyer's order history
// @route   GET /api/buyer/orders
// @access  Private (Buyer only)
export const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { buyerId: req.user._id };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('farmerId', 'name email phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order details
// @route   GET /api/buyer/orders/:id
// @access  Private (Buyer only)
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'name email phone location')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to the logged-in buyer
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/buyer/orders/:id/cancel
// @access  Private (Buyer only)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to the logged-in buyer
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await FarmerProduct.findById(item.productId);
      if (product) {
        product.availableQuantity += item.quantity;

        // Make product available again if it was unavailable due to stock
        if (!product.isAvailable && product.availableQuantity > 0) {
          product.isAvailable = true;
        }

        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    // Get buyer info
    const buyer = await User.findById(order.buyerId);
    const buyerName = buyer ? buyer.name : 'Buyer';

    // Get Socket.IO instance
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Send notification and email to farmer
    await notifyFarmerOrderCancelled(
      order.farmerId,
      {
        orderId: order.orderId,
        buyerName,
        totalAmount: order.totalAmount,
      },
      io,
      connectedUsers
    ).catch((err) => console.error('Error notifying farmer:', err));

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get buyer stats
// @route   GET /api/buyer/stats
// @access  Private (Buyer only)
export const getBuyerStats = async (req, res) => {
  try {
    const buyerId = req.user._id;

    // Get total orders
    const totalOrders = await Order.countDocuments({ buyerId });

    // Get orders by status
    const pendingOrders = await Order.countDocuments({
      buyerId,
      status: 'pending',
    });
    const confirmedOrders = await Order.countDocuments({
      buyerId,
      status: 'confirmed',
    });
    const inTransitOrders = await Order.countDocuments({
      buyerId,
      status: 'in-transit',
    });
    const deliveredOrders = await Order.countDocuments({
      buyerId,
      status: 'delivered',
    });
    const cancelledOrders = await Order.countDocuments({
      buyerId,
      status: 'cancelled',
    });

    // Calculate total spending
    const spendingData = await Order.aggregate([
      {
        $match: {
          buyerId: req.user._id,
          status: { $in: ['confirmed', 'in-transit', 'delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          totalSpending: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalSpending = spendingData.length > 0 ? spendingData[0].totalSpending : 0;

    // Get recent orders
    const recentOrders = await Order.find({ buyerId })
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          inTransit: inTransitOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        spending: {
          total: totalSpending,
        },
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
