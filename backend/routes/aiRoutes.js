import express from 'express';
import multer from 'multer';
import { 
  chatBot, 
  diagnoseCropDisease, 
  cropRecommendation, 
  priceRecommendation, 
  getSmartRecommendations 
} from '../controllers/aiController.js';

import os from 'os';

const router = express.Router();
const uploadDir = (process.env.VERCEL || process.env.NODE_ENV === 'production') ? os.tmpdir() : 'uploads/';
const upload = multer({ dest: uploadDir });

router.post('/chat', chatBot);
router.post('/diagnose-crop', upload.single('cropImage'), diagnoseCropDisease);
router.post('/crop-recommendation', cropRecommendation);
router.post('/price-recommendation', priceRecommendation);
router.get('/recommendations', getSmartRecommendations);

export default router;
