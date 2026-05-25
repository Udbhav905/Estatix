import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController';

const router = Router();
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllRead);
export default router;