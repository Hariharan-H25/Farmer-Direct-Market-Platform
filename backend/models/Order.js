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
    enum: [
      'Pending', 
      'Confirmed', 
      'Farmer Preparing', 
      'Processing', 
      'Packed', 
      'Pickup Pending', 
      'Picked Up', 
      'Shipped', 
      'Out for Delivery', 
      'Delivered', 
      'Cancelled', 
      'Returned'
    ], 
    default: 'Pending' 
  },
  shippingAddress: {
    recipientName: { type: String },
    mobileNumber: { type: String },
    houseFlat: { type: String },
    streetArea: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },
    deliveryInstructions: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    // Backward compatibility
    address: { type: String },
    phone: { type: String }
  },
  pickupLocation: {
    farmName: { type: String },
    farmerName: { type: String },
    phone: { type: String },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveryPerson: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  deliveryFee: { 
    type: Number, 
    default: 50 
  },
  liveLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
    heading: { type: Number },
    speed: { type: Number }
  },
  estimatedArrivalMinutes: { 
    type: Number 
  },
  returnReason: { type: String },
  statusHistory: [{
    status: { type: String },
    note: { type: String },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Performance indexes for buyer, farmer, and admin order lookups
orderSchema.index({ customer: 1 });
orderSchema.index({ 'items.farmer': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
