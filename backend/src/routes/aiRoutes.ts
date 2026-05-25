import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getAIRecommendations, smartMatch } from '../controllers/aiController';

const router = Router();
router.get('/recommendations', protect, getAIRecommendations);
router.get('/smart-match', protect, smartMatch);
export default router;