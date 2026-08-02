import express from 'express';
import multer from 'multer';
import { login, register, logout } from '../controllers/authController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/register', upload.single('produceImage'), register);
router.post('/logout', logout);

export default router;
