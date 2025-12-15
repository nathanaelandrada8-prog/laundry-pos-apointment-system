import express, { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createOrder, getUserOrders, updateOrder, getDashboardSummary } from '../controllers/orderController.js';

const router = express.Router();

// All routes here are accessed via /api/orders

// Middleware to ensure user is logged in for all order operations
router.use(protect);

// POST /api/orders - Create a new laundry order
router.post('/', createOrder);

// PUT /api/orders - update
router.put('/:id', updateOrder);

// GET /api/orders - Get all orders for the logged-in user
router.get('/', getUserOrders);

router.get('/summary', getDashboardSummary);

export default router;