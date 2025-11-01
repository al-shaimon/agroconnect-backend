import express from 'express';
import multer from 'multer';
import path from 'path';

// Controllers
import * as globalProductController from './globalProduct.controller.js';
import * as farmerProductController from './farmerProduct.controller.js';

// Middlewares
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ========================
// FARMER ROUTES (Private)
// ========================

// Get available global products to sell
router.get(
  '/farmer/available-products',
  protect,
  roleCheck(['farmer']),
  farmerProductController.getAvailableGlobalProducts
);

// Get farmer's own product offerings
router.get(
  '/farmer/my-products',
  protect,
  roleCheck(['farmer']),
  farmerProductController.getFarmerProducts
);

// Create or update farmer product offering
router.post(
  '/farmer/my-products',
  protect,
  roleCheck(['farmer']),
  farmerProductController.createOrUpdateFarmerProduct
);

// Update specific farmer product offering
router.put(
  '/farmer/my-products/:id',
  protect,
  roleCheck(['farmer']),
  farmerProductController.updateFarmerProduct
);

// Delete farmer product offering
router.delete(
  '/farmer/my-products/:id',
  protect,
  roleCheck(['farmer']),
  farmerProductController.deleteFarmerProduct
);

// ========================
// ADMIN ROUTES (Private)
// ========================

// Get all global products
router.get(
  '/admin/global-products',
  protect,
  roleCheck(['admin']),
  globalProductController.getAllGlobalProducts
);

// Get single global product
router.get(
  '/admin/global-products/:id',
  protect,
  roleCheck(['admin']),
  globalProductController.getGlobalProduct
);

// Create global product
router.post(
  '/admin/global-products',
  protect,
  roleCheck(['admin']),
  upload.single('images'),
  globalProductController.createGlobalProduct
);

// Update global product
router.put(
  '/admin/global-products/:id',
  protect,
  roleCheck(['admin']),
  upload.single('images'),
  globalProductController.updateGlobalProduct
);

// Delete global product
router.delete(
  '/admin/global-products/:id',
  protect,
  roleCheck(['admin']),
  globalProductController.deleteGlobalProduct
);

export default router;
