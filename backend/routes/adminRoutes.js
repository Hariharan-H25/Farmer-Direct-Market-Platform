import express from 'express';
import { getAllUsers, verifyFarmer, getAdminStats, getFarmerStats, deleteUser } from '../controllers/adminController.js';
import { authenticateUser, authorizeAdmin, authorizeFarmer } from '../middleware/auth.js';

const router = express.Router();

// Farmer analytics route
router.get('/farmer-stats', authenticateUser, authorizeFarmer, getFarmerStats);

// Admin-only management routes
router.get('/users', authenticateUser, authorizeAdmin, getAllUsers);
router.get('/stats', authenticateUser, authorizeAdmin, getAdminStats);
router.patch('/verify/:id', authenticateUser, authorizeAdmin, verifyFarmer);
router.delete('/users/:id', authenticateUser, authorizeAdmin, deleteUser);

export default router;
