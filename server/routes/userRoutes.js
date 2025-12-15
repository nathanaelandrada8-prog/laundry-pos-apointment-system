import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserProfilePage } from '../controllers/userController.js'; // Import the new controller function

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

// GET /user/order
router.get('/order', (req, res) => {
    res.render('layout/userLayout', {
        contentPartial: '../user/order',
        activePath: '../user/order',
        userName: req.user.name, 
    });
});

// GET /user/track
router.get('/track', (req, res) => {
    res.render('layout/userLayout', {
        contentPartial: '../user/track',
        activePath: '../user/track',
        userName: req.user.name, 
    });
});

// GET /user/history
router.get('/history', (req, res) => {
    res.render('layout/userLayout', {
        contentPartial: '../user/history',
        activePath: '../user/history',
        userName: req.user.name, 
    });
});

// GET /user/profile - Uses controller to fetch data and render
router.get('/profile', getUserProfilePage); 

// POST ROUTE FOR FORMS IN USERS PAGES

export default router;