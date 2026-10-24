import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'customer', 'farmer', 'delivery', 'admin'], 
    default: 'buyer' 
  },
  // Farmer & Buyer profile fields
  address: { type: String },
  farmName: { type: String },
  produceImage: { type: String },
  location: {
    district: { type: String },
    state: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  isVerified: { type: Boolean, default: false },
  isAuthorized: { type: Boolean, default: true },
  accountStatus: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Pending'], 
    default: 'Active' 
  },
  savedAddresses: [{
    recipientName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    houseFlat: { type: String, required: true },
    streetArea: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    deliveryInstructions: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    isDefault: { type: Boolean, default: false }
  }],
  languages: { type: [String], default: ['English'] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
