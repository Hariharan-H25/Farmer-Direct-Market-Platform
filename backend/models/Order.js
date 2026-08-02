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
  deliveryStatus: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Processing' 
  },
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    phone: { type: String }
  },
  createdAt: { type: Date, default: new Date() }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
