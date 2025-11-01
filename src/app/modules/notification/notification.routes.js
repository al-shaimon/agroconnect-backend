import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
