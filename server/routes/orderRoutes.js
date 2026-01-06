import express, { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createOrder, 
    getUserOrders, 
    updateOrder, 
    getDashboardSummary, 
    getPendingPickups,
    updateRequest } from '../controllers/orderController.js';

const router = express.Router();

// All routes here are accessed via /api/orders

// Middleware to ensure user is logged in for all order operations
router.use(protect);

// POST /api/orders - Create a new laundry order
router.post('/', createOrder);

// PUT /api/orders - update
router.put('/:id', updateOrder);

router.put('/handle-request/:id', updateRequest)

// GET /api/orders - Get all orders for the logged-in user
router.get('/', getUserOrders);

// GET /api/orders/pending - get pending request for pickup
router.get('/pending', getPendingPickups);

router.get('/summary', getDashboardSummary);

export default router;