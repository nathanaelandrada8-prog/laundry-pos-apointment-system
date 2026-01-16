import express from 'express';
import { loadProfile, updateUserProfile } from '../controllers/UserController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/me', protect, loadProfile);
router.put('/profile', protect, updateUserProfile);

export default router;