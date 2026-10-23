import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Online'], 
    default: 'COD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  deliveryStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'], 
    default: 'Pending' 
  },
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String }
  },
  returnReason: { type: String },
  statusHistory: [{
    status: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Performance indexes for buyer, farmer, and admin order lookups
orderSchema.index({ customer: 1 });
orderSchema.index({ 'items.farmer': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
