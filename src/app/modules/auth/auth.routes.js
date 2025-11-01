import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadVerificationDocument,
  deleteVerificationDocument,
} from './auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';
import { upload } from '../../../config/multer.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role').isIn(['farmer', 'buyer']).withMessage('Role must be either farmer or buyer'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
];

// Routes
router.post('/register', upload.single('profileImage'), registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put(
  '/profile',
  protect,
  upload.single('profileImage'),
  updateProfileValidation,
  validate,
  updateProfile
);
router.post(
  '/upload-verification',
  protect,
  upload.array('documents', 2),
  uploadVerificationDocument
);
router.delete('/verification-document/:documentId', protect, deleteVerificationDocument);

export default router;
