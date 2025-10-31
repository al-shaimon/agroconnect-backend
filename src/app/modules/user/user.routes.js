import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from './user.controller.js';
import { protect, admin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

router.route('/').get(getAllUsers);

router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;
