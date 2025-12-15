import mongoose from 'mongoose';

function isPickupDetailsRequired() {
    return this.fulfillmentMethod === 'pickup';
}

const pickupDetailsSchema = mongoose.Schema({
    pickupDate: {
        type: Date,
        required: [isPickupDetailsRequired, 'Path `pickupDetails.pickupDate` is required.'],
    },
    pickupTimeSlot: {
        type: String,
        required: [isPickupDetailsRequired, 'Path `pickupDetails.pickupTimeSlot` is required.'],
    },
    streetAddress: {
        type: String,
        required: [isPickupDetailsRequired, 'Path `pickupDetails.streetAddress` is required.'],
        trim: true,
    },
    city: {
        type: String,
        required: [isPickupDetailsRequired, 'Path `pickupDetails.city` is required.'],
        trim: true,
    },
    postalCode: {
        type: String,
        required: [isPickupDetailsRequired, 'Path `pickupDetails.postalCode` is required.'],
        trim: true,
    },
});

const userOrderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        fulfillmentMethod: {
            type: String,
            required: true,
            enum: ['pickup', 'walkin'],
            default: 'walkin'
        },
        serviceType: {
            type: String,
            required: true,
            enum: ['wash_fold', 'dry_cleaning'],
        },
        estimatedQuantity: {
            type: Number,
            required: true,
            min: [0.1, 'Quantity must be greater than 0.'],
        },
        pickupDetails: {
            type: pickupDetailsSchema,
        },
        specialInstructions: {
            type: String,
            default: '',
        },
        estimatedCost: {
            subtotal: { type: Number, required: true, default: 0 },
            deliveryFee: { type: Number, required: true, default: 0 },
            total: { type: Number, required: true, default: 0 },
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Picked Up', 'In Progress', 'Ready', 'Delivered'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

// Export the model
const Order = mongoose.model('Order', userOrderSchema);

export default Order;