import express from 'express';
import { createOrder, getOrders, updateOrder, moveToHistory } from '../controllers/OrderController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.get('/get-orders', protect, getOrders);
router.put('/update-order/:id', protect, updateOrder);
router.post('/move-to-history/:id', protect, moveToHistory);


export default router;