import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply both protect and adminOnly middleware to all routes in this router
router.use(protect, adminOnly);

// GET /admin/dashboard
router.get('/dashboard', (req, res) => {
    res.render('layout/adminLayout', {
        contentPartial: '../admin/dashboard',
        activePath: '../admin/dashboard',
    });
});

// GET /admin/pos
router.get('/pos', (req, res) => {
    res.render('layout/adminLayout', {
        contentPartial: '../admin/pos',
        activePath: '../admin/pos',
    });
});

export default router;