import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes defined here will use the userLayout and require authentication.

// Apply the protect middleware to all routes in this router
router.use(protect);

// GET /user/dashboard
router.get('/dashboard', (req, res) => {
    res.render('layout/userLayout', {
        contentPartial: '../user/dashboard',
        activePath: '../user/dashboard',
        userName: req.user.name,
    });
});

// GET /user/schedule
router.get('/schedule', (req, res) => {
    res.render('layout/userLayout', {
        contentPartial: '../user/schedule',
        activePath: '../user/schedule',
        userName: req.user.name, 
    });
});

export default router;