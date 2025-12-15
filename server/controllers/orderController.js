import Order from "../models/userOrderModel.js";
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// --- Helper function for calculating estimated costs ---
const calculateEstimatedCost = (serviceType, estimatedQuantity, fulfillmentMethod) => {
    let subtotal = 0;
    const DELIVERY_FEE = 50;

    // 1. Calculate Subtotal
    if (serviceType === 'wash_fold') {
        const PRICE_PER_KG = 80;
        subtotal = estimatedQuantity * PRICE_PER_KG;
    } else if (serviceType === 'dry_cleaning') {
        const PRICE_PER_ITEM = 150;
        subtotal = estimatedQuantity * PRICE_PER_ITEM;
    } else {
        // Should not happen if validation is correct
        subtotal = 0;
    }

    // 2. Determine Delivery Fee
    const deliveryFee = fulfillmentMethod === 'pickup' ? DELIVERY_FEE : 0;

    // 3. Calculate Total
    const total = subtotal + deliveryFee;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
};


// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Requires authentication)
const createOrder = asyncHandler(async (req, res) => {
    // NOTE: req.user should be populated by authentication middleware
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, user not authenticated.');
    }

    const {
        fulfillmentMethod,
        serviceType,
        estimatedQuantity,
        pickupDate,
        pickupTimeSlot,
        streetAddress,
        city,
        postalCode,
        specialInstructions
    } = req.body;

    // 1. Basic validation check for required fields
    if (!fulfillmentMethod || !serviceType || !estimatedQuantity) {
        res.status(400);
        throw new Error('Missing required fields: fulfillment method, service type, or estimated quantity.');
    }

    const estimatedQuantityNum = Number(estimatedQuantity);
    if (isNaN(estimatedQuantityNum) || estimatedQuantityNum <= 0) {
        res.status(400);
        throw new Error('Estimated quantity must be a positive number.');
    }

    // 2. Cost Calculation
    const estimatedCost = calculateEstimatedCost(serviceType, estimatedQuantityNum, fulfillmentMethod);

    // 3. Construct Pickup Details (conditional)
    // NOTE: Date fields are handled by the Mongoose schema (userOrderModel.js) to be required only when fulfillmentMethod is 'pickup'
    const pickupDetails = fulfillmentMethod === 'pickup' ? {
        pickupDate: pickupDate ? new Date(pickupDate) : undefined,
        pickupTimeSlot,
        streetAddress,
        city,
        postalCode
    } : {};
    
    // 4. Create the order object
    const order = new Order({
        user: req.user._id,
        fulfillmentMethod,
        serviceType,
        estimatedQuantity: estimatedQuantityNum,
        pickupDetails,
        specialInstructions: specialInstructions || '',
        estimatedCost,
        status: 'Pending'
    });

    // 5. Save the order and handle Mongoose validation errors
    try {
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        // If it's a Mongoose validation error (e.g., missing a required pickup field)
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400);
            // Throw the first validation message found
            const firstError = Object.values(error.errors)[0].message;
            throw new Error(`Validation Error: ${firstError}`);
        }
        // Other errors (like DB connection failure)
        res.status(500);
        throw new Error(`Could not create order: ${error.message}`);
    }
});


// @desc    Get all orders for the logged-in user
// @route   GET /api/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
    // Find all orders associated with the logged-in user ID, sorted by creation date descending
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Returns an array of orders, with the most recent order at index 0
    res.json(orders);
});

// @desc    Update an order (only if status is 'Pending')
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { fulfillmentMethod, specialInstructions, pickupDetails } = req.body;

    // 1. Find the existing order
    const order = await Order.findById(orderId);

    if (order) {
        // 2. Check authorization: Ensure the logged-in user owns the order
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this order.');
        }

        // 3. Check status: Only allow updates if the status is 'Pending'
        if (order.status !== 'Pending') {
            res.status(400);
            throw new Error(`Order can only be edited when status is 'Pending'. Current status: ${order.status}`);
        }
        
        // 4. Store original fulfillment method for cost recalculation
        const originalFulfillmentMethod = order.fulfillmentMethod;

        // 5. Update core fields
        order.fulfillmentMethod = fulfillmentMethod || order.fulfillmentMethod;
        order.specialInstructions = specialInstructions !== undefined ? specialInstructions : order.specialInstructions;
        
        // 6. Handle fulfillment method change and update pickupDetails
        if (order.fulfillmentMethod === 'pickup') {
            if (!pickupDetails) {
                 res.status(400);
                 throw new Error('Missing pickup details object in request body for a pickup order.');
            }
            
            // Assign new/updated pickup details. Use || null to ensure empty strings are converted to null,
            // allowing Mongoose validation to correctly identify missing required fields.
            order.pickupDetails = {
                // Convert to Date object, or null if falsy (empty string)
                pickupDate: pickupDetails.pickupDate ? new Date(pickupDetails.pickupDate) : null,
                pickupTimeSlot: pickupDetails.pickupTimeSlot || null,
                streetAddress: pickupDetails.streetAddress || null,
                city: pickupDetails.city || null,
                postalCode: pickupDetails.postalCode || null
            };
            
        } else if (order.fulfillmentMethod === 'walkin') {
            // If changing to walkin, clear pickup details (set to empty object)
            order.pickupDetails = {};
        }

        // 7. Recalculate cost if fulfillment method changed
        if (order.isModified('fulfillmentMethod') || originalFulfillmentMethod !== order.fulfillmentMethod) {
            order.estimatedCost = calculateEstimatedCost(
                order.serviceType, 
                order.estimatedQuantity, 
                order.fulfillmentMethod
            );
        }

        // 8. Save and return the updated order
        try {
             const updatedOrder = await order.save();
             res.json(updatedOrder);
        } catch (error) {
            // Catch Mongoose validation errors and return a user-friendly message
            if (error instanceof mongoose.Error.ValidationError) {
                // This is the error the user is seeing.
                res.status(400);
                let validationMessage = 'Order validation failed: ';
                const errors = Object.values(error.errors);
                validationMessage += errors.map(e => `${e.path}: ${e.message}`).join(', ');
                throw new Error(validationMessage);
            }
            res.status(500);
            throw new Error(`Could not update order: ${error.message}`);
        }

    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// Helper function to format dates nicely for the dashboard
const formatOrderDate = (date) => {
    if (!date) return 'N/A';
    // Use the pickupDate if available, otherwise use creation date
    const d = date.pickupDetails?.pickupDate || date.createdAt; 
    
    // Simple date format: YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Helper function to determine Estimated Completion Time (Mock/Simple Logic)
const getEstimatedCompletion = (status) => {
    if (status === 'Processing' || status === 'Pending') {
        // Simple mock: assume delivery/completion is tomorrow at 5 PM if pending/processing
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}, 5:00 PM`;
    }
    return 'N/A';
};


// @desc    Get aggregated data for the user dashboard
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, user not authenticated.');
    }

    const userId = req.user._id;

    // --- 1. Aggregated Statistics ---
    const statsAggregation = await Order.aggregate([
        { $match: { user: userId, status: 'Completed' } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                // Aggregate estimatedQuantity (e.g., total KG/items) only for completed orders
                totalQuantity: { $sum: '$estimatedQuantity' }, 
                // Aggregate total cost from the nested estimatedCost object
                lifetimeSpend: { $sum: '$estimatedCost.total' },
            },
        },
    ]);

    const stats = statsAggregation.length > 0 ? statsAggregation[0] : {};

    // --- 2. Current Active Order ---
    // Find the most recent order that is not 'Completed' or 'Cancelled'
    const currentOrder = await Order.findOne({ 
        user: userId, 
        status: { $nin: ['Completed', 'Cancelled', 'Delivered'] } 
    }).sort({ createdAt: -1 }).limit(1);

    // --- 3. Recent Activity ---
    // Fetch the last 5 orders, regardless of status
    const recentOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5);


    // --- 4. Format and Send Response ---
    res.json({
        totalOrders: stats.totalOrders || 0,
        totalQuantity: (stats.totalQuantity || 0).toFixed(1), // Total KG or Items
        lifetimeSpend: (stats.lifetimeSpend || 0).toFixed(2), // Total money spent

        currentOrder: currentOrder ? {
            orderId: currentOrder._id.toString().slice(-6).toUpperCase(), // Use last 6 chars of ID for mock
            status: currentOrder.status,
            serviceType: currentOrder.serviceType.replace(/_/g, ' '),
            estimatedCompletion: getEstimatedCompletion(currentOrder.status),
            // The route link should include the actual Mongoose _id
            trackingLink: `/user/track/${currentOrder._id.toString()}`
        } : null,

        recentOrders: recentOrders.map(order => ({
            orderId: order._id.toString().slice(-6).toUpperCase(),
            date: formatOrderDate(order),
            serviceType: order.serviceType.replace(/_/g, ' '),
            status: order.status,
            orderLink: `/user/track/${order._id.toString()}`
        })),
    });
});


export { createOrder, getUserOrders, updateOrder, getDashboardSummary };