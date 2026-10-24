import express from 'express';
import { 
  getAllUsers, 
  verifyFarmer, 
  toggleUserStatus,
  getDeliveryPersonnel,
  createDeliveryPersonnel,
  assignDeliveryOrder,
  getAuditLogs,
  getAdminStats, 
  getFarmerStats, 
  deleteUser 
} from '../controllers/adminController.js';
import { authenticateUser, authorizeAdmin, authorizeFarmer } from '../middleware/auth.js';

const router = express.Router();

// Farmer analytics route
router.get('/farmer-stats', authenticateUser, authorizeFarmer, getFarmerStats);

// Admin-only management routes
router.get('/users', authenticateUser, authorizeAdmin, getAllUsers);
router.patch('/users/:id/status', authenticateUser, authorizeAdmin, toggleUserStatus);
router.get('/stats', authenticateUser, authorizeAdmin, getAdminStats);
router.patch('/verify/:id', authenticateUser, authorizeAdmin, verifyFarmer);
router.delete('/users/:id', authenticateUser, authorizeAdmin, deleteUser);

// Delivery Fleet Management
router.get('/delivery-personnel', authenticateUser, authorizeAdmin, getDeliveryPersonnel);
router.post('/delivery-personnel', authenticateUser, authorizeAdmin, createDeliveryPersonnel);
router.post('/assign-delivery', authenticateUser, authorizeAdmin, assignDeliveryOrder);

// Audit Logs
router.get('/audit-logs', authenticateUser, authorizeAdmin, getAuditLogs);

export default router;
