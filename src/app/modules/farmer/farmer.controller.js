import FarmerProduct from '../product/farmerProduct.model.js';
import Order from '../order/order.model.js';
import User from '../auth/auth.model.js';
import Notification from '../notification/notification.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';
import { notifyOrderStatusUpdate } from '../../../utils/notificationHelper.js';

// Helper function to handle file upload in both dev and prod
const handleFileUpload = async (file, folder) => {
  if (!file) return null;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  try {
    let result;

    if (isProduction) {
      // Production: Upload buffer directly to Cloudinary
      result = await uploadToCloudinary(file.buffer, folder);
    } else {
      // Development: Upload from file path
      result = await uploadToCloudinary(file.path, folder);

      // Delete local file after successful upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return result;
  } catch (error) {
    // Clean up local file on error (development only)
    if (!isProduction && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

// @desc    Create new product
// @route   POST /api/farmer/products
// @access  Private (Farmer only)
export const createProduct = async (req, res) => {
  try {
    // Check if farmer is verified
    if (req.user.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message:
          'You must be verified by admin before adding products. Please upload your verification documents and wait for approval.',
      });
    }

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
      const result = await handleFileUpload(req.file, folderPath);

      if (result) {
        imageUrl = result.secure_url;
        cloudinaryPublicId = result.public_id;
      }
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
    // Clean up uploaded file if error occurs (development only)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    if (!isProduction && req.file && req.file.path && fs.existsSync(req.file.path)) {
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
    // Check if farmer is verified
    if (req.user.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'You must be verified by admin before updating products.',
      });
    }

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
      const result = await handleFileUpload(req.file, folderPath);

      if (result) {
        req.body.imageUrl = result.secure_url;
        req.body.cloudinaryPublicId = result.public_id;
      }
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
    // Clean up uploaded file if error occurs (development only)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    if (!isProduction && req.file && req.file.path && fs.existsSync(req.file.path)) {
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

    // Get farmer name for notification
    const farmer = await User.findById(order.farmerId);
    const farmerName = farmer ? farmer.name : 'the farmer';

    // Get Socket.IO instance and connected users
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Send notification and email to buyer
    await notifyOrderStatusUpdate(
      order.buyerId,
      order._id,
      status,
      farmerName,
      io,
      connectedUsers
    ).catch((err) => console.error('Error notifying buyer:', err));

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

    // Get total farmer products
    const totalProducts = await FarmerProduct.countDocuments({ farmerId });

    // Get available products
    const availableProducts = await FarmerProduct.countDocuments({
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
        $group: {
          _id: '$items.productName',
          productName: { $first: '$items.productName' },
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
