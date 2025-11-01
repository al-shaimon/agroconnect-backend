import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer ID is required'],
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee ID is required'],
    },
    reviewerRole: {
      type: String,
      enum: ['buyer', 'farmer'],
      required: [true, 'Reviewer role is required'],
    },
    // 5 criteria ratings (1-5 stars each)
    ratings: {
      // For Farmers (when buyer reviews):
      // 1. Product Quality
      productQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 2. Accuracy (product matches description)
      accuracy: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 3. Communication
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 4. Packaging
      packaging: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 5. Timeliness
      timeliness: {
        type: Number,
        min: 1,
        max: 5,
      },

      // For Buyers (when farmer reviews):
      // 1. Payment Promptness
      paymentPromptness: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 2. Communication
      // (communication is shared)
      // 3. Professionalism
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 4. Clear Requirements
      clarity: {
        type: Number,
        min: 1,
        max: 5,
      },
      // 5. Respectfulness
      respectfulness: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    // Average rating (calculated from the 5 criteria)
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Written review/comment
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    // Response from the reviewee (optional)
    response: {
      type: String,
      maxlength: [500, 'Response cannot exceed 500 characters'],
    },
    respondedAt: {
      type: Date,
    },
    // Public visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reviewSchema.index({ revieweeId: 1, isPublic: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ reviewerId: 1 });

// Calculate average rating before saving
reviewSchema.pre('save', function (next) {
  const ratings = this.ratings;
  let sum = 0;
  let count = 0;

  // Count only the ratings that are relevant for the reviewer role
  if (this.reviewerRole === 'buyer') {
    // Buyer reviewing farmer
    if (ratings.productQuality && ratings.productQuality > 0) {
      sum += ratings.productQuality;
      count++;
    }
    if (ratings.accuracy && ratings.accuracy > 0) {
      sum += ratings.accuracy;
      count++;
    }
    if (ratings.communication && ratings.communication > 0) {
      sum += ratings.communication;
      count++;
    }
    if (ratings.packaging && ratings.packaging > 0) {
      sum += ratings.packaging;
      count++;
    }
    if (ratings.timeliness && ratings.timeliness > 0) {
      sum += ratings.timeliness;
      count++;
    }
  } else if (this.reviewerRole === 'farmer') {
    // Farmer reviewing buyer
    if (ratings.paymentPromptness && ratings.paymentPromptness > 0) {
      sum += ratings.paymentPromptness;
      count++;
    }
    if (ratings.communication && ratings.communication > 0) {
      sum += ratings.communication;
      count++;
    }
    if (ratings.professionalism && ratings.professionalism > 0) {
      sum += ratings.professionalism;
      count++;
    }
    if (ratings.clarity && ratings.clarity > 0) {
      sum += ratings.clarity;
      count++;
    }
    if (ratings.respectfulness && ratings.respectfulness > 0) {
      sum += ratings.respectfulness;
      count++;
    }
  }

  // If count is 0 (no ratings), set average to 0, otherwise calculate
  this.averageRating = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
