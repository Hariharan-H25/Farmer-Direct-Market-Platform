import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'farmer', 'admin'], 
    default: 'customer' 
  },
  // Farmer specific fields
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
  languages: { type: [String], default: ['English'] },
  createdAt: { type: Date, default: new Date() }
});

const User = mongoose.model('User', userSchema);

export default User;
