import Product from '../product/product.model.js';
import Order from '../order/order.model.js';
import Notification from '../notification/notification.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';

// @desc    Create new product
// @route   POST /api/farmer/products
// @access  Private (Farmer only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      unit,
      availableQuantity,
      quality,
      harvestDate,
      location,
    } = req.body;

    let imageUrl = '';
    let cloudinaryPublicId = '';

    // Handle image upload if provided
    if (req.file) {
      const folderPath = `agroconnect/products/${req.user._id}`;
      const result = await uploadToCloudinary(req.file.path, folderPath);
      imageUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;

      // Delete temporary file
      fs.unlinkSync(req.file.path);
    }

    const product = await Product.create({
      farmerId: req.user._id,
      name,
      category,
      description,
      price,
      unit,
      availableQuantity,
      imageUrl,
      cloudinaryPublicId,
      quality,
      harvestDate,
      location,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products by logged-in farmer
// @route   GET /api/farmer/products
// @access  Private (Farmer only)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user._id }).sort({
      createdAt: -1,
    });

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
// @route   GET /api/farmer/products/:id
// @access  Private (Farmer only)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product belongs to the logged-in farmer
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this product',
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

// @desc    Update product
// @route   PUT /api/farmer/products/:id
// @access  Private (Farmer only)
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product belongs to the logged-in farmer
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (product.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(product.cloudinaryPublicId, 'image');
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Upload new image
      const folderPath = `agroconnect/products/${req.user._id}`;
      const result = await uploadToCloudinary(req.file.path, folderPath);
      req.body.imageUrl = result.secure_url;
      req.body.cloudinaryPublicId = result.public_id;

      // Delete temporary file
      fs.unlinkSync(req.file.path);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/farmer/products/:id
// @access  Private (Farmer only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product belongs to the logged-in farmer
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    // Delete image from Cloudinary if exists
    if (product.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(product.cloudinaryPublicId, 'image');
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders for farmer's products
// @route   GET /api/farmer/orders
// @access  Private (Farmer only)
export const getFarmerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { farmerId: req.user._id };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('buyerId', 'name email phone location')
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

// @desc    Update order status
// @route   PUT /api/farmer/orders/:id/status
// @access  Private (Farmer only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to the logged-in farmer
    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    order.status = status;

    // Set delivery date if status is delivered
    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();

    // Create notification for buyer
    await Notification.create({
      recipientId: order.buyerId,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order ${order.orderId} status has been updated to ${status}`,
      orderId: order._id,
    });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get farmer dashboard stats
// @route   GET /api/farmer/stats
// @access  Private (Farmer only)
export const getFarmerStats = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Get total products
    const totalProducts = await Product.countDocuments({ farmerId });

    // Get available products
    const availableProducts = await Product.countDocuments({
      farmerId,
      isAvailable: true,
      availableQuantity: { $gt: 0 },
    });

    // Get total orders
    const totalOrders = await Order.countDocuments({ farmerId });

    // Get orders by status
    const pendingOrders = await Order.countDocuments({
      farmerId,
      status: 'pending',
    });
    const confirmedOrders = await Order.countDocuments({
      farmerId,
      status: 'confirmed',
    });
    const inTransitOrders = await Order.countDocuments({
      farmerId,
      status: 'in-transit',
    });
    const deliveredOrders = await Order.countDocuments({
      farmerId,
      status: 'delivered',
    });
    const cancelledOrders = await Order.countDocuments({
      farmerId,
      status: 'cancelled',
    });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          farmerId: req.user._id,
          status: { $in: ['delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find({ farmerId })
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          available: availableProducts,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          inTransit: inTransitOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          total: totalRevenue,
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

// @desc    Get revenue analytics by product
// @route   GET /api/farmer/analytics/revenue
// @access  Private (Farmer only)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { days = 30 } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get revenue by product
    const revenueByProduct = await Order.aggregate([
      {
        $match: {
          farmerId: farmerId,
          status: 'delivered',
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$productDetails.name' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: revenueByProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
