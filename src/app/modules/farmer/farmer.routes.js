import express from 'express';
import {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFarmerOrders,
  updateOrderStatus,
  getFarmerStats,
} from './farmer.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';

const router = express.Router();

// All routes require authentication and farmer role
router.use(protect);
router.use(roleCheck(['farmer']));

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('availableQuantity')
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a positive number'),
];

const orderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'])
    .withMessage('Invalid status value'),
];

// Product routes
router.route('/products').post(productValidation, validate, createProduct).get(getMyProducts);

router.route('/products/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

// Order routes
router.get('/orders', getFarmerOrders);
router.put('/orders/:id/status', orderStatusValidation, validate, updateOrderStatus);

// Stats route
router.get('/stats', getFarmerStats);

export default router;
