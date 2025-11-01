import Product from '../product/product.model.js';
import Order from '../order/order.model.js';
import Notification from '../notification/notification.model.js';
import ProductSlot from '../product/productSlot.model.js';

// @desc    Browse all available products (with filters)
// @route   GET /api/buyer/products
// @access  Private (Buyer only)
export const browseProducts = async (req, res) => {
  try {
    const {
      category,
      quality,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter
    const filter = { isAvailable: true, availableQuantity: { $gt: 0 } };

    if (category) {
      filter.category = category;
    }

    if (quality) {
      filter.quality = quality;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const products = await Product.find(filter)
      .populate('farmerId', 'name phone location email')
      .sort(sortObj);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product details
// @route   GET /api/buyer/products/:id
// @access  Private (Buyer only)
export const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmerId',
      'name phone location email'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      // Validate delivery slot if provided
      let slotInfo = null;
      if (item.slotId) {
        const slot = await ProductSlot.findById(item.slotId);

        if (!slot) {
          return res.status(404).json({
            success: false,
            message: `Delivery slot not found for product ${product.name}`,
          });
        }

        // Verify slot belongs to this product
        if (slot.productId.toString() !== product._id.toString()) {
          return res.status(400).json({
            success: false,
            message: `Invalid slot for product ${product.name}`,
          });
        }

        // Check if slot is active
        if (!slot.isActive) {
          return res.status(400).json({
            success: false,
            message: `Selected delivery slot for ${product.name} is no longer active`,
          });
        }

        // Check slot availability
        if (slot.availableQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity in selected slot for ${product.name}. Available: ${slot.availableQuantity}, Requested: ${item.quantity}`,
          });
        }

        // Deduct quantity from slot
        slot.availableQuantity -= item.quantity;
        await slot.save();

        slotInfo = {
          slotId: slot._id,
          date: slot.date,
          timeSlot: slot.timeSlot,
        };
      }

      if (!product.isAvailable || product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available in the requested quantity`,
        });
      }

      // All items must be from the same farmer
      if (farmerId === null) {
        farmerId = product.farmerId;
      } else if (farmerId.toString() !== product.farmerId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'All items in an order must be from the same farmer',
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      const orderItem = {
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        pricePerUnit: product.price,
        subtotal,
      };

      // Add slot info if available
      if (slotInfo) {
        orderItem.deliverySlot = slotInfo;
      }

      orderItems.push(orderItem);

      // Reduce product quantity
      product.availableQuantity -= item.quantity;
      if (product.availableQuantity === 0) {
        product.isAvailable = false;
      }
      await product.save();
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

    // Create notification for farmer
    await Notification.create({
      recipientId: farmerId,
      type: 'order',
      title: 'New Order Received',
      message: `You have received a new order ${order.orderId} for ৳${totalAmount}`,
      orderId: order._id,
    });

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
      const product = await Product.findById(item.productId);
      if (product) {
        product.availableQuantity += item.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    // Create notification for farmer
    await Notification.create({
      recipientId: order.farmerId,
      type: 'order',
      title: 'Order Cancelled',
      message: `Order ${order.orderId} has been cancelled by the buyer`,
      orderId: order._id,
    });

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
