import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },
    quality: {
      type: String,
      enum: ['Premium', 'Standard', 'Organic'],
      default: 'Standard',
    },
    harvestDate: {
      type: Date,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
productSchema.index({ name: 'text', category: 'text', description: 'text' });
productSchema.index({ farmerId: 1 });
productSchema.index({ isAvailable: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
