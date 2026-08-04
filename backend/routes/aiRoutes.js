import express from 'express';
import multer from 'multer';
import { 
  chatBot, 
  diagnoseCropDisease, 
  cropRecommendation, 
  priceRecommendation, 
  getSmartRecommendations 
} from '../controllers/aiController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/chat', chatBot);
router.post('/diagnose-crop', upload.single('cropImage'), diagnoseCropDisease);
router.post('/crop-recommendation', cropRecommendation);
router.post('/price-recommendation', priceRecommendation);
router.get('/recommendations', getSmartRecommendations);

export default router;
