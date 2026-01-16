import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Service Details
  method: { type: String, required: true }, // e.g., 'wash_dry'
  
  // Schedule
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  
  // Address Object
  address: {
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    addressNotes: { type: String }
  },

  bill: {
    weight: { type: Number, default: 0 },
    pricePerKg: { type: Number, default: 0 },
    additionalFees: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    billedAt: { type: Date }
  },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Pick Up', 'In Progress', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;