import express from 'express';
import {
  createReview,
  getUserReviews,
  getMyReviews,
  getReceivedReviews,
  canReviewOrder,
  addResponse,
} from './review.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);

// Protected routes
router.use(protect);

router.post('/', createReview);
router.get('/my-reviews', getMyReviews);
router.get('/received', getReceivedReviews);
router.get('/can-review/:orderId', canReviewOrder);
router.put('/:id/response', addResponse);

export default router;
