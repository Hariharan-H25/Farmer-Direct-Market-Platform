import express from 'express';
import { createOrder, fetchAllOrders } from '../controllers/orderController.js';
import { authenticateUser, authorizeBuyer } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateUser, fetchAllOrders);
router.post('/', authenticateUser, authorizeBuyer, createOrder);

export default router;
