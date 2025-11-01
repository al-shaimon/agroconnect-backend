import GlobalProduct from './globalProduct.model.js';
import FarmerProduct from './farmerProduct.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';

// @desc    Create a new global product (Admin only)
// @route   POST /api/admin/global-products
// @access  Private (Admin only)
export const createGlobalProduct = async (req, res) => {
  try {
    const { name, category, description, unit } = req.body;

    // Check if product already exists
    const existingProduct = await GlobalProduct.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists',
      });
    }

    // Handle image upload
    let images = [];
    let cloudinaryPublicIds = [];

    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, 'agroconnect/products');

        images.push(result.secure_url);
        cloudinaryPublicIds.push(result.public_id);

        // Delete local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Delete local file if upload fails
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error('Failed to upload image to Cloudinary');
      }
    }

    const globalProduct = await GlobalProduct.create({
      name: name.trim(),
      category,
      description,
      unit: unit || 'kg',
      images,
      cloudinaryPublicIds,
    });

    res.status(201).json({
      success: true,
      message: 'Global product created successfully',
      data: globalProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all global products
// @route   GET /api/admin/global-products
// @access  Public
export const getAllGlobalProducts = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const products = await GlobalProduct.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single global product with all farmer offerings
// @route   GET /api/admin/global-products/:id
// @access  Public
export const getGlobalProduct = async (req, res) => {
  try {
    const globalProduct = await GlobalProduct.findById(req.params.id);

    if (!globalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get all farmer offerings for this product
    const farmerOfferings = await FarmerProduct.find({
      globalProductId: req.params.id,
      isAvailable: true,
    }).populate('farmerId', 'name email location rating');

    res.status(200).json({
      success: true,
      data: {
        ...globalProduct.toObject(),
        farmerOfferings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update global product
// @route   PUT /api/admin/global-products/:id
// @access  Private (Admin only)
export const updateGlobalProduct = async (req, res) => {
  try {
    const { name, category, description, unit, isActive } = req.body;

    const product = await GlobalProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update fields
    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (unit) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    // Handle new image upload
    if (req.file) {
      try {
        // Delete old images from cloudinary
        for (const publicId of product.cloudinaryPublicIds) {
          await cloudinary.uploader.destroy(publicId).catch(console.error);
        }

        // Upload new image to Cloudinary
        const result = await uploadToCloudinary(req.file.path, 'agroconnect/products');

        product.images = [result.secure_url];
        product.cloudinaryPublicIds = [result.public_id];

        // Delete local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Delete local file if upload fails
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error('Failed to upload image to Cloudinary');
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete global product
// @route   DELETE /api/admin/global-products/:id
// @access  Private (Admin only)
export const deleteGlobalProduct = async (req, res) => {
  try {
    const product = await GlobalProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete images from cloudinary
    for (const publicId of product.cloudinaryPublicIds) {
      await cloudinary.uploader.destroy(publicId).catch(console.error);
    }

    // Delete all farmer products associated with this global product
    await FarmerProduct.deleteMany({ globalProductId: req.params.id });

    await GlobalProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product and all farmer offerings deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createGlobalProduct,
  getAllGlobalProducts,
  getGlobalProduct,
  updateGlobalProduct,
  deleteGlobalProduct,
};
