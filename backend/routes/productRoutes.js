import express from 'express';
import multer from 'multer';
import { getProducts, getProductById, createProduct, updateProduct, updateStock, deleteProduct, addReview } from '../controllers/productController.js';
import { authenticateUser, authorizeFarmer, authorizeBuyer } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpg, jpeg, png, webp) up to 5MB are allowed!"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit
  fileFilter
});

router.get('/', getProducts);
router.get('/:id', getProductById);

// Farmer product management routes
router.post('/', authenticateUser, authorizeFarmer, upload.array('images', 5), createProduct);
router.put('/:id', authenticateUser, authorizeFarmer, upload.array('images', 5), updateProduct);
router.patch('/:id/stock', authenticateUser, authorizeFarmer, updateStock);
router.delete('/:id', authenticateUser, authorizeFarmer, deleteProduct);

// Buyer product rating and review route
router.post('/:id/review', authenticateUser, authorizeBuyer, addReview);

export default router;
