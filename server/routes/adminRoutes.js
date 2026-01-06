import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

// GET /admin/dashboard
router.get('/dashboard', (req, res) => {
    res.render('layout/adminLayout', {
        contentPartial: '../admin/dashboard',
        activePath: '../admin/dashboard',
        userName: req.user.name, 
    });
});

// GET /admin/pos
router.get('/pos', (req, res) => {
    res.render('layout/adminLayout', {
        contentPartial: '../admin/pos',
        activePath: '../admin/pos',
        userName: req.user.name, 
    });
});

// GET /admin/pending
router.get('/pending', (req, res) => {
    res.render('layout/adminLayout', {
        contentPartial: '../admin/pending',
        activePath: '../admin/pending',
        userName: req.user.name, 
    });
});

export default router;