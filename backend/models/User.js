import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'customer', 'farmer', 'admin'], 
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
  languages: { type: [String], default: ['English'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
