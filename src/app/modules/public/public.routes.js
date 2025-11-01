import express from 'express';
import { browsePublicProducts, getPublicStats, getCategories } from './public.controller.js';
import { getPublicProductSlots } from '../product/productSlot.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/products', browsePublicProducts);
router.get('/products/:productId/slots', getPublicProductSlots);
router.get('/stats', getPublicStats);
router.get('/categories', getCategories);

export default router;
