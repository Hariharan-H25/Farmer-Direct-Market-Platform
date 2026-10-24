import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  },
  otpHash: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['registration', 'login', 'reset'], 
    default: 'registration' 
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  maxAttempts: { 
    type: Number, 
    default: 5 
  },
  resendCooldownUntil: { 
    type: Date, 
    default: () => new Date(Date.now() + 60 * 1000) 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// TTL index to automatically prune expired OTP records
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
