import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  getBuyerStats,
} from './buyer.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';

const router = express.Router();

// All routes require authentication and buyer role
router.use(protect);
router.use(roleCheck(['buyer']));

// Validation rules
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('deliveryAddress.area').notEmpty().withMessage('Delivery area is required'),
  body('deliveryAddress.city').notEmpty().withMessage('Delivery city is required'),
];

// Order routes
router.post('/orders', orderValidation, validate, placeOrder);
router.get('/orders', getMyOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/cancel', cancelOrder);

// Stats route
router.get('/stats', getBuyerStats);

export default router;
