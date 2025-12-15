import express from 'express';
import { updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply the protect middleware to all routes in this API router
router.use(protect);

// @route   PUT /api/users/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', updateUserProfile);

export default router;