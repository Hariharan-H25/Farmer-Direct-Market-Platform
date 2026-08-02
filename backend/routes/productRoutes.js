import express from 'express';
import multer from 'multer';
import { getProducts, createProduct, updateStock, deleteProduct } from '../controllers/productController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', getProducts);
router.post('/', auth, upload.single('image'), createProduct);
router.patch('/:id/stock', auth, updateStock);
router.delete('/:id', auth, deleteProduct);

export default router;
