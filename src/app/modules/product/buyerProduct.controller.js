import GlobalProduct from './globalProduct.model.js';
import FarmerProduct from './farmerProduct.model.js';
import User from '../auth/auth.model.js';
import Review from '../review/review.model.js';
import mongoose from 'mongoose';

// @desc    Get all global products with farmer offerings
// @route   GET /api/buyer/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, quality, sortBy = 'createdAt' } = req.query;

    // Build query for global products
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get global products
    const globalProducts = await GlobalProduct.find(query).sort({ [sortBy]: -1 });

    // For each global product, get count of farmers selling it and min price
    const productsWithDetails = await Promise.all(
      globalProducts.map(async (product) => {
        const farmerQuery = {
          globalProductId: product._id,
          isAvailable: true,
          availableQuantity: { $gt: 0 },
        };

        // Apply filters
        if (minPrice || maxPrice) {
          farmerQuery.price = {};
          if (minPrice) farmerQuery.price.$gte = parseFloat(minPrice);
          if (maxPrice) farmerQuery.price.$lte = parseFloat(maxPrice);
        }

        if (quality) {
          farmerQuery.quality = quality;
        }

        const farmerProducts = await FarmerProduct.find(farmerQuery);

        const prices = farmerProducts.map((fp) => fp.price);
        const minProductPrice = prices.length > 0 ? Math.min(...prices) : null;
        const maxProductPrice = prices.length > 0 ? Math.max(...prices) : null;

        return {
          ...product.toObject(),
          farmersCount: farmerProducts.length,
          minPrice: minProductPrice,
          maxPrice: maxProductPrice,
          available: farmerProducts.length > 0,
        };
      })
    );

    // Filter out products with no farmers if price/quality filters applied
    const filteredProducts =
      minPrice || maxPrice || quality
        ? productsWithDetails.filter((p) => p.available)
        : productsWithDetails;

    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product details with all farmer offerings
// @route   GET /api/buyer/products/:id
// @access  Public
export const getProductDetails = async (req, res) => {
  try {
    const { sortBy = 'price', order = 'asc' } = req.query;

    const globalProduct = await GlobalProduct.findById(req.params.id);

    if (!globalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get all farmer offerings for this product
    const farmerProducts = await FarmerProduct.find({
      globalProductId: globalProduct._id,
      isAvailable: true,
      availableQuantity: { $gt: 0 },
    }).populate({
      path: 'farmerId',
      select: 'name email phone location',
    });

    // Calculate average rating for each farmer
    const farmerIds = farmerProducts.map((fp) => fp.farmerId._id);
    const ratings = await Review.aggregate([
      {
        $match: {
          revieweeId: { $in: farmerIds },
          isPublic: true,
        },
      },
      {
        $group: {
          _id: '$revieweeId',
          averageRating: { $avg: '$averageRating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a map of farmer ratings
    const ratingMap = new Map(
      ratings.map((r) => [
        r._id.toString(),
        { rating: r.averageRating, totalReviews: r.totalReviews },
      ])
    );

    // Add ratings to farmer data
    const farmersWithRatings = farmerProducts.map((fp) => {
      const farmerRating = ratingMap.get(fp.farmerId._id.toString());
      return {
        ...fp.toObject(),
        farmerId: {
          ...fp.farmerId.toObject(),
          rating: farmerRating ? Math.round(farmerRating.rating * 10) / 10 : undefined,
          totalReviews: farmerRating ? farmerRating.totalReviews : 0,
        },
      };
    });

    // Sort farmer offerings
    const sortOrder = order === 'desc' ? -1 : 1;
    farmersWithRatings.sort((a, b) => {
      if (sortBy === 'price') {
        return (a.price - b.price) * sortOrder;
      } else if (sortBy === 'rating') {
        const ratingA = a.farmerId?.rating || 0;
        const ratingB = b.farmerId?.rating || 0;
        return (ratingA - ratingB) * sortOrder;
      } else if (sortBy === 'quantity') {
        return (a.availableQuantity - b.availableQuantity) * sortOrder;
      }
      return 0;
    });

    // Calculate statistics
    const prices = farmersWithRatings.map((fp) => fp.price);
    const stats = {
      totalFarmers: farmersWithRatings.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
    };

    res.status(200).json({
      success: true,
      data: {
        product: globalProduct,
        farmers: farmersWithRatings,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get farmer's specific product offering
// @route   GET /api/buyer/farmer-products/:id
// @access  Public
export const getFarmerProductDetails = async (req, res) => {
  try {
    const farmerProduct = await FarmerProduct.findById(req.params.id)
      .populate('globalProductId')
      .populate({
        path: 'farmerId',
        select: 'name email phone location rating totalReviews',
      });

    if (!farmerProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!farmerProduct.isAvailable || farmerProduct.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently unavailable',
      });
    }

    res.status(200).json({
      success: true,
      data: farmerProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search products by category or name
// @route   GET /api/buyer/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const globalProducts = await GlobalProduct.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });

    // Get farmer counts for each product
    const productsWithDetails = await Promise.all(
      globalProducts.map(async (product) => {
        const farmersCount = await FarmerProduct.countDocuments({
          globalProductId: product._id,
          isAvailable: true,
          availableQuantity: { $gt: 0 },
        });

        return {
          ...product.toObject(),
          farmersCount,
          available: farmersCount > 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: productsWithDetails.length,
      data: productsWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all available categories
// @route   GET /api/buyer/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await GlobalProduct.distinct('category', { isActive: true });

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

export default {
  getAllProducts,
  getProductDetails,
  getFarmerProductDetails,
  searchProducts,
  getCategories,
};
