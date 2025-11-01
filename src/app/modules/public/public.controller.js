import Product from '../product/product.model.js';
import User from '../auth/auth.model.js';
import Order from '../order/order.model.js';

// @desc    Browse products (no auth required)
// @route   GET /api/public/products
// @access  Public
export const browsePublicProducts = async (req, res) => {
  try {
    const {
      category,
      quality,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 20,
      page = 1,
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

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('farmerId', 'name location phone')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get public platform stats
// @route   GET /api/public/stats
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    // User stats
    const totalFarmers = await User.countDocuments({
      role: 'farmer',
      isActive: true,
    });
    const totalBuyers = await User.countDocuments({
      role: 'buyer',
      isActive: true,
    });

    // Product stats
    const totalProducts = await Product.countDocuments({
      isAvailable: true,
      availableQuantity: { $gt: 0 },
    });

    // Category stats
    const categoryStats = await Product.aggregate([
      {
        $match: { isAvailable: true, availableQuantity: { $gt: 0 } },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Order stats
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({
      status: 'delivered',
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          farmers: totalFarmers,
          buyers: totalBuyers,
        },
        products: {
          total: totalProducts,
          byCategory: categoryStats,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product categories
// @route   GET /api/public/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', {
      isAvailable: true,
      availableQuantity: { $gt: 0 },
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
