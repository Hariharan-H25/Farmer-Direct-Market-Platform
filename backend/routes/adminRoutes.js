import express from 'express';
import { getAllUsers, verifyFarmer, getAdminStats, deleteUser } from '../controllers/adminController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes with authentication AND admin role authorization
router.use(authenticateUser, authorizeAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getAdminStats);
router.patch('/verify/:id', verifyFarmer);
router.delete('/users/:id', deleteUser);

export default router;
