import express from 'express';
import { upload } from '../../../config/multer.js';

// Controllers
import * as globalProductController from './globalProduct.controller.js';
import * as farmerProductController from './farmerProduct.controller.js';

// Middlewares
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';

const router = express.Router();

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
