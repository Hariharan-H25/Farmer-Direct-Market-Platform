import express from 'express';
import { 
  createOrder, 
  getBuyerOrders, 
  getFarmerOrders, 
  fetchAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  requestReturn 
} from '../controllers/orderController.js';
import { authenticateUser, authorizeBuyer, authorizeFarmer, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Role-specific order listing routes
router.get('/my-orders', authenticateUser, authorizeBuyer, getBuyerOrders);
router.get('/farmer-orders', authenticateUser, authorizeFarmer, getFarmerOrders);
router.get('/', authenticateUser, fetchAllOrders);

// Single order details & order actions
router.get('/:id', authenticateUser, getOrderById);
router.post('/', authenticateUser, authorizeBuyer, createOrder);
router.patch('/:id/status', authenticateUser, authorizeFarmer, updateOrderStatus);
router.patch('/:id/cancel', authenticateUser, cancelOrder);
router.patch('/:id/return', authenticateUser, authorizeBuyer, requestReturn);

export default router;
