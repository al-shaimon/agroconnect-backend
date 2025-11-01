import express from 'express';
import {
  getAllUsers,
  getUserDetails,
  verifyUser,
  updateUserStatus,
  deleteUser,
  getAllOrders,
  getOrderDetails,
  getPlatformStats,
  sendBroadcast,
} from './admin.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';
import verificationRoutes from './verification.routes.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(roleCheck(['admin']));

// Verification management routes
router.use('/verifications', verificationRoutes);

// Validation rules
const broadcastValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('recipientRole').isIn(['farmer', 'buyer', 'all']).withMessage('Invalid recipient role'),
];

const userStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean value'),
];

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/status', userStatusValidation, validate, updateUserStatus);
router.delete('/users/:id', deleteUser);

// Order oversight routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);

// Platform stats
router.get('/stats', getPlatformStats);

// Broadcast notification
router.post('/broadcast', broadcastValidation, validate, sendBroadcast);

export default router;
