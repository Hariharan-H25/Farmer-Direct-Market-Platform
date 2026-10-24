import express from 'express';
import {
  getDeliveryOrders,
  acceptDeliveryOrder,
  updateDeliveryStatus,
  updateLiveLocation,
  getOrderTracking
} from '../controllers/deliveryController.js';
import { authenticateUser, authorizeDelivery } from '../middleware/auth.js';

const router = express.Router();

// Order tracking endpoint (accessible by customer, farmer, delivery person, and admin)
router.get('/track/:id', authenticateUser, getOrderTracking);

// Delivery partner dashboard and assignment routes
router.get('/orders', authenticateUser, authorizeDelivery, getDeliveryOrders);
router.patch('/orders/:id/accept', authenticateUser, authorizeDelivery, acceptDeliveryOrder);
router.patch('/orders/:id/status', authenticateUser, authorizeDelivery, updateDeliveryStatus);
router.post('/orders/:id/location', authenticateUser, authorizeDelivery, updateLiveLocation);

export default router;
