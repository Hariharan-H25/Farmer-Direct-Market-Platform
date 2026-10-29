import express from 'express';
import multer from 'multer';
import { 
  login, 
  register, 
  verifyOTP, 
  resendOTP, 
  logout, 
  getProfile, 
  updateProfile, 
  getSavedAddresses, 
  addSavedAddress, 
  updateSavedAddress,
  deleteSavedAddress, 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from '../controllers/authController.js';
import { authenticateUser, authorizeBuyer } from '../middleware/auth.js';

const router = express.Router();

import os from 'os';

const uploadDir = (process.env.VERCEL || process.env.NODE_ENV === 'production') ? os.tmpdir() : 'uploads/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/register', upload.single('produceImage'), register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logout);

// Profile endpoints
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

// Saved Delivery Addresses (Swiggy/Zomato style with strict ownership)
router.get('/addresses', authenticateUser, getSavedAddresses);
router.post('/addresses', authenticateUser, addSavedAddress);
router.put('/addresses/:addressId', authenticateUser, updateSavedAddress);
router.delete('/addresses/:addressId', authenticateUser, deleteSavedAddress);

// Wishlist endpoints
router.get('/wishlist', authenticateUser, getWishlist);
router.post('/wishlist/:productId', authenticateUser, authorizeBuyer, addToWishlist);
router.delete('/wishlist/:productId', authenticateUser, authorizeBuyer, removeFromWishlist);

export default router;
