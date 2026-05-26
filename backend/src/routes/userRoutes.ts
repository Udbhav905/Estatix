import { Router } from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { updateAvatar } from '../controllers/userController';

const router = Router();

router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

export default router;
