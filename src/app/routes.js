import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './modules/auth/auth.routes.js';
import farmerRoutes from './modules/farmer/farmer.routes.js';
import buyerRoutes from './modules/buyer/buyer.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import reviewRoutes from './modules/review/review.routes.js';
import productRoutes from './modules/product/product.routes.js';
import driverRoutes from './modules/driver/driver.routes.js';
import * as buyerProductController from './modules/product/buyerProduct.controller.js';

const router = express.Router();

// Public buyer product routes (no auth required)
router.get('/buyer/products', buyerProductController.getAllProducts);
router.get('/buyer/products/:id', buyerProductController.getProductDetails);
router.get('/buyer/farmer-products/:id', buyerProductController.getFarmerProductDetails);
router.get('/buyer/search', buyerProductController.searchProducts);
router.get('/buyer/categories', buyerProductController.getCategories);

// API Routes
router.use('/auth', authRoutes);
router.use('/farmer', farmerRoutes);
router.use('/buyer', buyerRoutes); // Now only has orders and stats (protected)
router.use('/driver', driverRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/public', publicRoutes);
router.use('/reviews', reviewRoutes);
router.use('/products', productRoutes);

// Health check route
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message: 'AgroConnect API Health Check',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus[dbState],
      host: mongoose.connection.host || 'N/A',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
