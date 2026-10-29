import express from 'express';
import { 
  createOrder, 
  getBuyerOrders, 
  getFarmerOrders, 
  fetchAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  requestReturn,
  createRazorpayOrder,
  verifyRazorpayPayment,
  exportOrdersCSV,
  getOrderInvoice
} from '../controllers/orderController.js';
import { authenticateUser, authorizeBuyer, authorizeFarmer, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Role-specific order listing routes with strict data isolation
router.get('/my-orders', authenticateUser, authorizeBuyer, getBuyerOrders);
router.get('/farmer-orders', authenticateUser, authorizeFarmer, getFarmerOrders);
router.get('/', authenticateUser, (req, res) => {
  if (req.userRole === 'admin') {
    return fetchAllOrders(req, res);
  } else if (req.userRole === 'farmer') {
    return getFarmerOrders(req, res);
  } else {
    return getBuyerOrders(req, res);
  }
});

// Sales CSV export route (Farmers and Admin)
router.get('/export/csv', authenticateUser, exportOrdersCSV);

// Razorpay & UPI Payment Gateway Routes
router.post('/razorpay-order', authenticateUser, createRazorpayOrder);
router.post('/verify-payment', authenticateUser, verifyRazorpayPayment);

// Single order details, invoice & order actions
router.get('/:id/invoice', authenticateUser, getOrderInvoice);
router.get('/:id', authenticateUser, getOrderById);
router.post('/', authenticateUser, authorizeBuyer, createOrder);
router.patch('/:id/status', authenticateUser, authorizeFarmer, updateOrderStatus);
router.patch('/:id/cancel', authenticateUser, cancelOrder);
router.patch('/:id/return', authenticateUser, authorizeBuyer, requestReturn);

export default router;
