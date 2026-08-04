import express from 'express';
import { getNearbyFarmers } from '../controllers/farmerController.js';

const router = express.Router();

router.get('/nearby', getNearbyFarmers);

export default router;
