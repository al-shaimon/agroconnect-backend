import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import farmerRoutes from './modules/farmer/farmer.routes.js';
import buyerRoutes from './modules/buyer/buyer.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import reviewRoutes from './modules/review/review.routes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/farmer', farmerRoutes);
router.use('/buyer', buyerRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/public', publicRoutes);
router.use('/reviews', reviewRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgroConnect API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
