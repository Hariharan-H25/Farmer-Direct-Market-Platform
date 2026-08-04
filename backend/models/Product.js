import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: [
      // Farm Produce
      'Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy',
      // Agri Inputs (BigHaat style)
      'Seeds', 'Crop Protection', 'Fertilizers', 'Tools',
      'Irrigation', 'Farming Equip', 'Organic', 'Specialty'
    ] 
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // for discount display
  discount: { type: Number, default: 0 }, // percentage discount
  unit: { type: String, default: 'kg' },
  quantity: { type: Number, required: true },
  image: { type: String },
  images: [{ type: String }],
  brand: { type: String },
  location: { type: String }, // e.g. 'Erode, TN'
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false  // not required for admin-added agri inputs
  },
  status: { 
    type: String, 
    enum: ['Available', 'Out of Stock', 'Seasonal'], 
    default: 'Available' 
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String },
    date: { type: Date, default: new Date() }
  }],
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() }
});

// Compound and text indexes for performance optimization
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ farmer: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
