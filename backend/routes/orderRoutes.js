import express from 'express';
import { createOrder, fetchAllOrders } from '../controllers/orderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, fetchAllOrders);
router.post('/', auth, createOrder);

export default router;
