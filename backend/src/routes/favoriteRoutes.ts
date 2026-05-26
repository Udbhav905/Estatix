import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController';

const router = Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/', toggleFavorite);

export default router;
