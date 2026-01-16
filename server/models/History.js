import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    originalOrderId: { type: mongoose.Schema.Types.ObjectId },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: String,
    method: String,
    bill: {
        weight: Number,
        pricePerKg: Number,
        additionalFees: Number,
        totalAmount: Number,
        billedAt: Date
    },
    status: { type: String, default: 'Completed' },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const historyModel = mongoose.model('History', historySchema);

export default historyModel;