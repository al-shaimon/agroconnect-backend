import mongoose from 'mongoose';

const productSlotSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      start: {
        type: String, // Format: "10:00"
        required: true,
      },
      end: {
        type: String, // Format: "12:00"
        required: true,
      },
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    originalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique slot per product per date per time
productSlotSchema.index({ productId: 1, date: 1, 'timeSlot.start': 1 }, { unique: true });

// Index for efficient queries
productSlotSchema.index({ farmerId: 1, date: 1 });
productSlotSchema.index({ productId: 1, date: 1, isActive: 1 });

const ProductSlot = mongoose.model('ProductSlot', productSlotSchema);

export default ProductSlot;
