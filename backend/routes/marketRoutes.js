import express from 'express';
import { getMarketTrends } from '../controllers/marketController.js';

const router = express.Router();

router.get('/trends', getMarketTrends);

export default router;
