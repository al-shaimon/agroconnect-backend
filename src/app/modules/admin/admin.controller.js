import User from '../auth/auth.model.js';
import Order from '../order/order.model.js';
import Product from '../product/product.model.js';
import Notification from '../notification/notification.model.js';

// @desc    Get all users (with filters by role)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, isActive } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get additional stats based on role
    let additionalData = {};

    if (user.role === 'farmer') {
      const productCount = await Product.countDocuments({ farmerId: user._id });
      const orderCount = await Order.countDocuments({ farmerId: user._id });
      additionalData = { productCount, orderCount };
    } else if (user.role === 'buyer') {
      const orderCount = await Order.countDocuments({ buyerId: user._id });
      additionalData = { orderCount };
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        ...additionalData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify user account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = true;
    await user.save();

    // Create notification for user
    await Notification.create({
      recipientId: user._id,
      type: 'system',
      title: 'Account Verified',
      message: 'Your account has been verified by the administrator',
    });

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Activate/deactivate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide isActive status',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = isActive;
    await user.save();

    // Create notification for user
    await Notification.create({
      recipientId: user._id,
      type: 'system',
      title: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
      message: `Your account has been ${
        isActive ? 'activated' : 'deactivated'
      } by the administrator`,
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (oversight)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
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

// @desc    Get order details
// @route   GET /api/admin/orders/:id
// @access  Private (Admin only)
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone location')
      .populate('farmerId', 'name email phone location')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
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

// @desc    Platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getPlatformStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Product stats
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({
      isAvailable: true,
      availableQuantity: { $gt: 0 },
    });

    // Order stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const inTransitOrders = await Order.countDocuments({
      status: 'in-transit',
    });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue stats
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'in-transit', 'delivered'] },
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

    // Recent activities
    const recentOrders = await Order.find()
      .populate('buyerId', 'name')
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          buyers: totalBuyers,
          verified: verifiedUsers,
          active: activeUsers,
        },
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
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send broadcast notification
// @route   POST /api/admin/broadcast
// @access  Private (Admin only)
export const sendBroadcast = async (req, res) => {
  try {
    const { title, message, recipientRole } = req.body;

    if (!title || !message || !recipientRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, message, and recipientRole',
      });
    }

    if (!['farmer', 'buyer', 'all'].includes(recipientRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipientRole. Must be farmer, buyer, or all',
      });
    }

    // Create broadcast notification
    const notification = await Notification.create({
      recipientRole,
      type: 'broadcast',
      title,
      message,
    });

    // Get count of affected users
    const filter = recipientRole === 'all' ? {} : { role: recipientRole };
    const affectedUsers = await User.countDocuments(filter);

    res.status(201).json({
      success: true,
      message: `Broadcast sent successfully to ${affectedUsers} users`,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
