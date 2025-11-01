import mongoose from 'mongoose';

const farmerProductSchema = new mongoose.Schema(
  {
    globalProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GlobalProduct',
      required: [true, 'Global product ID is required'],
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
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
      area: String,
      city: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one farmer can only have one listing per global product
farmerProductSchema.index({ globalProductId: 1, farmerId: 1 }, { unique: true });
farmerProductSchema.index({ farmerId: 1 });
farmerProductSchema.index({ globalProductId: 1 });
farmerProductSchema.index({ isAvailable: 1 });

const FarmerProduct = mongoose.model('FarmerProduct', farmerProductSchema);

export default FarmerProduct;
