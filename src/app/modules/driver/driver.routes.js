import express from 'express';
import {
  getDriverProfile,
  updateDriverProfile,
  updateAvailability,
  updateLocation,
  getAvailableOrders,
  getMyOrders,
  acceptOrder,
  updateDeliveryStatus,
  getDriverStats,
  getNearbyDrivers,
} from './driver.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { roleCheck } from '../../middlewares/roleCheck.middleware.js';
import { upload } from '../../../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Driver-only routes
router.get('/profile', roleCheck(['driver']), getDriverProfile);
router.put(
  '/profile',
  roleCheck(['driver']),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
  ]),
  updateDriverProfile
);
router.put('/availability', roleCheck(['driver']), updateAvailability);
router.put('/location', roleCheck(['driver']), updateLocation);
router.get('/available-orders', roleCheck(['driver']), getAvailableOrders);
router.get('/my-orders', roleCheck(['driver']), getMyOrders);
router.post('/accept-order/:orderId', roleCheck(['driver']), acceptOrder);
router.put('/order/:orderId/status', roleCheck(['driver']), updateDeliveryStatus);
router.get('/stats', roleCheck(['driver']), getDriverStats);

// Admin route to find nearby drivers
router.get('/nearby', roleCheck(['admin']), getNearbyDrivers);

export default router;
