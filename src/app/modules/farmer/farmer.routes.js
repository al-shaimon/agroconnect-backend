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
  getRevenueAnalytics,
} from './farmer.controller.js';
import {
  createOrUpdateSlots,
  getProductSlots,
  getFarmerSlots,
  toggleSlotStatus,
  deleteSlot,
  getAvailableTimeSlots,
} from '../product/productSlot.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';
import { upload } from '../../../config/multer.js';

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
router
  .route('/products')
  .post(upload.single('image'), productValidation, validate, createProduct)
  .get(getMyProducts);

router
  .route('/products/:id')
  .get(getProductById)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

// Order routes
router.get('/orders', getFarmerOrders);
router.put('/orders/:id/status', orderStatusValidation, validate, updateOrderStatus);

// Stats route
router.get('/stats', getFarmerStats);

// Analytics route
router.get('/analytics/revenue', getRevenueAnalytics);

// Slot management routes
router.get('/slots/available-times', getAvailableTimeSlots);
router.get('/slots', getFarmerSlots);
router.post('/products/:productId/slots', createOrUpdateSlots);
router.get('/products/:productId/slots', getProductSlots);
router.patch('/slots/:slotId/toggle', toggleSlotStatus);
router.delete('/slots/:slotId', deleteSlot);

export default router;
