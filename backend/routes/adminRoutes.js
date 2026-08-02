import express from 'express';
import { getAllUsers, verifyFarmer, getAdminStats, deleteUser } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/users', auth, getAllUsers);
router.get('/stats', auth, getAdminStats);
router.patch('/verify/:id', auth, verifyFarmer);
router.delete('/users/:id', auth, deleteUser);

export default router;
