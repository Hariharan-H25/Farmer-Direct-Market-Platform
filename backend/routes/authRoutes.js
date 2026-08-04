import express from 'express';
import multer from 'multer';
import { login, register, logout, getProfile, updateProfile, getWishlist, addToWishlist, removeFromWishlist } from '../controllers/authController.js';
import { authenticateUser, authorizeBuyer } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/register', upload.single('produceImage'), register);
router.post('/logout', logout);

// Profile endpoints
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

// Wishlist endpoints
router.get('/wishlist', authenticateUser, getWishlist);
router.post('/wishlist/:productId', authenticateUser, authorizeBuyer, addToWishlist);
router.delete('/wishlist/:productId', authenticateUser, authorizeBuyer, removeFromWishlist);

export default router;
