import mongoose from 'mongoose';
import Review from './review.model.js';
import Order from '../order/order.model.js';
import User from '../auth/auth.model.js';

// @desc    Create a review (buyer reviews farmer OR farmer reviews buyer)
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { orderId, revieweeId, ratings, comment } = req.body;

    // Verify order exists and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review delivered orders',
      });
    }

    // Verify user is part of this order
    const reviewerId = req.user._id;
    const reviewerRole = req.user.role;

    if (
      reviewerId.toString() !== order.buyerId.toString() &&
      reviewerId.toString() !== order.farmerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this order',
      });
    }

    // Verify reviewee is the other party in the transaction
    if (reviewerRole === 'buyer' && revieweeId !== order.farmerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewee for this order',
      });
    }

    if (reviewerRole === 'farmer' && revieweeId !== order.buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewee for this order',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      orderId,
      reviewerId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    }

    // Validate ratings based on reviewer role
    if (reviewerRole === 'buyer') {
      const requiredFields = [
        'productQuality',
        'accuracy',
        'communication',
        'packaging',
        'timeliness',
      ];
      for (const field of requiredFields) {
        if (!ratings[field] || ratings[field] < 1 || ratings[field] > 5) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} rating. Must be between 1 and 5`,
          });
        }
      }
    } else if (reviewerRole === 'farmer') {
      const requiredFields = [
        'paymentPromptness',
        'communication',
        'professionalism',
        'clarity',
        'respectfulness',
      ];
      for (const field of requiredFields) {
        if (!ratings[field] || ratings[field] < 1 || ratings[field] > 5) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} rating. Must be between 1 and 5`,
          });
        }
      }
    }

    // Create review
    const review = await Review.create({
      orderId,
      reviewerId,
      revieweeId,
      reviewerRole,
      ratings,
      comment,
    });

    // Populate for response
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name profileImage')
      .populate('revieweeId', 'name profileImage')
      .populate('orderId', 'orderId totalAmount');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get reviews for a user (farmer or buyer)
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      revieweeId: userId,
      isPublic: true,
    })
      .populate('reviewerId', 'name profileImage role')
      .populate('orderId', 'orderId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      revieweeId: userId,
      isPublic: true,
    });

    // Calculate overall rating
    const ratingStats = await Review.aggregate([
      {
        $match: {
          revieweeId: new mongoose.Types.ObjectId(userId),
          isPublic: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' },
          totalReviews: { $sum: 1 },
          fiveStars: {
            $sum: { $cond: [{ $gte: ['$averageRating', 4.5] }, 1, 0] },
          },
          fourStars: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gte: ['$averageRating', 3.5] }, { $lt: ['$averageRating', 4.5] }],
                },
                1,
                0,
              ],
            },
          },
          threeStars: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gte: ['$averageRating', 2.5] }, { $lt: ['$averageRating', 3.5] }],
                },
                1,
                0,
              ],
            },
          },
          twoStars: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gte: ['$averageRating', 1.5] }, { $lt: ['$averageRating', 2.5] }],
                },
                1,
                0,
              ],
            },
          },
          oneStar: {
            $sum: { $cond: [{ $lt: ['$averageRating', 1.5] }, 1, 0] },
          },
        },
      },
    ]);

    const stats =
      ratingStats.length > 0
        ? ratingStats[0]
        : {
            averageRating: 0,
            totalReviews: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          };

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        reviews: reviews,
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          distribution: {
            5: stats.fiveStars,
            4: stats.fourStars,
            3: stats.threeStars,
            2: stats.twoStars,
            1: stats.oneStar,
          },
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

// @desc    Get my reviews (as reviewer)
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewerId: req.user._id,
    })
      .populate('revieweeId', 'name profileImage role')
      .populate('orderId', 'orderId totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get reviews received (as reviewee)
// @route   GET /api/reviews/received
// @access  Private
export const getReceivedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      revieweeId: req.user._id,
    })
      .populate('reviewerId', 'name profileImage role')
      .populate('orderId', 'orderId totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check if order can be reviewed by current user
// @route   GET /api/reviews/can-review/:orderId
// @access  Private
export const canReviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    console.log('Checking review eligibility for order:', {
      orderId: order._id,
      orderStatus: order.status,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      currentUserId: req.user._id,
      currentUserRole: req.user.role,
    });

    // Check if order is delivered
    if (order.status !== 'delivered') {
      console.log('Order not delivered yet:', order.status);
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
          reason: 'Order must be delivered before reviewing',
        },
      });
    }

    // Check if user is part of this order
    const userId = req.user._id;
    if (
      userId.toString() !== order.buyerId.toString() &&
      userId.toString() !== order.farmerId.toString()
    ) {
      console.log('User not part of order:', {
        userId: userId.toString(),
        buyerId: order.buyerId.toString(),
        farmerId: order.farmerId.toString(),
      });
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
          reason: 'You are not part of this order',
        },
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      orderId,
      reviewerId: userId,
    });

    if (existingReview) {
      console.log('User already reviewed this order');
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
          reason: 'You have already reviewed this order',
          review: existingReview,
        },
      });
    }

    console.log('User can review this order');
    res.status(200).json({
      success: true,
      data: {
        canReview: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private
export const addResponse = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required',
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Only the reviewee can respond
    if (review.revieweeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewee can respond to this review',
      });
    }

    review.response = response;
    review.respondedAt = new Date();
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name profileImage')
      .populate('revieweeId', 'name profileImage');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createReview,
  getUserReviews,
  getMyReviews,
  getReceivedReviews,
  canReviewOrder,
  addResponse,
};
