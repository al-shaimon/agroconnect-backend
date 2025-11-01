import express from 'express';
import {
  getPendingVerifications,
  getAllVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
  getVerificationStats,
} from './verification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, roleCheck(['admin']));

// Routes
router.get('/stats', getVerificationStats);
router.get('/pending', getPendingVerifications);
router.get('/', getAllVerifications);
router.get('/:id', getVerificationDetails);
router.put('/:id/approve', approveVerification);
router.put('/:id/reject', rejectVerification);

export default router;
