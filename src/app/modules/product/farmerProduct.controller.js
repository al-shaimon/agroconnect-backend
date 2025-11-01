import FarmerProduct from './farmerProduct.model.js';
import GlobalProduct from './globalProduct.model.js';
import User from '../auth/auth.model.js';

// @desc    Get farmer's available global products to sell
// @route   GET /api/farmer/available-products
// @access  Private (Farmer only)
export const getAvailableGlobalProducts = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Get all active global products
    const globalProducts = await GlobalProduct.find({ isActive: true }).sort({ name: 1 });

    // Get farmer's existing product offerings
    const farmerProducts = await FarmerProduct.find({ farmerId });

    // Mark which products farmer is already selling
    const productsWithStatus = globalProducts.map((product) => {
      const existing = farmerProducts.find(
        (fp) => fp.globalProductId.toString() === product._id.toString()
      );

      return {
        ...product.toObject(),
        isSelected: !!existing,
        farmerProductId: existing?._id,
        currentPrice: existing?.price,
        currentQuantity: existing?.availableQuantity,
      };
    });

    res.status(200).json({
      success: true,
      count: productsWithStatus.length,
      data: productsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create or update farmer product offering
// @route   POST /api/farmer/my-products
// @access  Private (Farmer only)
export const createOrUpdateFarmerProduct = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { globalProductId, price, availableQuantity, quality, harvestDate } = req.body;

    // Validate global product exists
    const globalProduct = await GlobalProduct.findById(globalProductId);
    if (!globalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!globalProduct.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This product is not active',
      });
    }

    // Get farmer location
    const farmer = await User.findById(farmerId);
    const location = farmer.location || {};

    // Check if farmer already has this product
    let farmerProduct = await FarmerProduct.findOne({ globalProductId, farmerId });

    if (farmerProduct) {
      // Update existing
      farmerProduct.price = price;
      farmerProduct.availableQuantity = availableQuantity;
      if (quality) farmerProduct.quality = quality;
      if (harvestDate) farmerProduct.harvestDate = harvestDate;
      farmerProduct.location = location;
      farmerProduct.isAvailable = availableQuantity > 0;

      await farmerProduct.save();

      return res.status(200).json({
        success: true,
        message: 'Product offering updated successfully',
        data: farmerProduct,
      });
    }

    // Create new
    farmerProduct = await FarmerProduct.create({
      globalProductId,
      farmerId,
      price,
      availableQuantity,
      quality: quality || 'Standard',
      harvestDate,
      location,
      isAvailable: availableQuantity > 0,
    });

    res.status(201).json({
      success: true,
      message: 'Product offering created successfully',
      data: farmerProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get farmer's product offerings
// @route   GET /api/farmer/my-products
// @access  Private (Farmer only)
export const getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const farmerProducts = await FarmerProduct.find({ farmerId })
      .populate('globalProductId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmerProducts.length,
      data: farmerProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update farmer product offering
// @route   PUT /api/farmer/my-products/:id
// @access  Private (Farmer only)
export const updateFarmerProduct = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { price, availableQuantity, quality, harvestDate, isAvailable } = req.body;

    const farmerProduct = await FarmerProduct.findOne({
      _id: req.params.id,
      farmerId,
    });

    if (!farmerProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not authorized',
      });
    }

    if (price !== undefined) farmerProduct.price = price;
    if (availableQuantity !== undefined) {
      farmerProduct.availableQuantity = availableQuantity;
      farmerProduct.isAvailable = availableQuantity > 0;
    }
    if (quality) farmerProduct.quality = quality;
    if (harvestDate) farmerProduct.harvestDate = harvestDate;
    if (isAvailable !== undefined) farmerProduct.isAvailable = isAvailable;

    await farmerProduct.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: farmerProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete farmer product offering
// @route   DELETE /api/farmer/my-products/:id
// @access  Private (Farmer only)
export const deleteFarmerProduct = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const farmerProduct = await FarmerProduct.findOneAndDelete({
      _id: req.params.id,
      farmerId,
    });

    if (!farmerProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product offering removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAvailableGlobalProducts,
  createOrUpdateFarmerProduct,
  getFarmerProducts,
  updateFarmerProduct,
  deleteFarmerProduct,
};
