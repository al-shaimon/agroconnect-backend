import mongoose from 'mongoose';

const globalProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    cloudinaryPublicIds: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
globalProductSchema.index({ name: 'text', category: 'text', description: 'text' });
globalProductSchema.index({ category: 1 });
globalProductSchema.index({ isActive: 1 });

const GlobalProduct = mongoose.model('GlobalProduct', globalProductSchema);

export default GlobalProduct;
