import Order from '../models/OrderModel.js';
import History from '../models/History.js'
import asyncHandler from 'express-async-handler';

/**
 * @desc    Create New Order
 * @route   POST /api/orders/create-order
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    try {
        const { id, name, email, phone, address } = req.user;
        const orderDetails = req.body;

        const newOrder = new Order({
            userId: id,
            fullName: name,
            email: email,
            phone: phone,
            address: address,
            
            method: orderDetails.method,
            pickupDate: orderDetails.pickupDate,
            pickupTime: orderDetails.pickupTime,
            deliveryDate: orderDetails.deliveryDate,
            deliveryTime: orderDetails.deliveryTime
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * @desc    Get Orders (All for Admin, Specific for Customer)
 * @route   GET /api/orders/get-orders
 * @access  Private
 */
const getOrders = asyncHandler(async (req, res) => {
    try {
        let filter = {};

        // If the user is NOT an admin, restrict the search to their own ID
        if (req.user.role !== 'admin') {
            filter = { userId: req.user.id };
        }

        // Admin gets everything; Customer gets only theirs
        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(10);
        
        res.json({ 
            success: true, 
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


/**
 * @desc    Update order (Status and/or Billing)
 * @route   PUT /api/orders/update-order/:id
 * @access  Private (Admin Only)
 */
const updateOrder = asyncHandler(async (req, res) => {
    try {
        const { status, bill } = req.body;
        const updateData = {};

        if (status) updateData.status = status;
        
        if (bill) {
            updateData.bill = {
                weight: Number(bill.weight),
                pricePerKg: Number(bill.pricePerKg),
                additionalFees: Number(bill.additionalFees),
                totalAmount: Number(bill.totalAmount),
                billedAt: new Date()
            };
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @desc    Move completed order to history collection
 * @route   POST /api/orders/move-to-history/:id
 */
const moveToHistory = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // 1. Find the active order
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found or already archived');
    }

    // 2. Create the history record with all existing data + metadata
    const historyEntry = new History({
        ...order.toObject(),
        archivedAt: new Date(),
        originalOrderId: order._id
    });

    await historyEntry.save();

    // 3. Delete from active orders
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        success: true,
        message: 'Order successfully moved to history'
    });
});

export { createOrder, getOrders, updateOrder, moveToHistory};