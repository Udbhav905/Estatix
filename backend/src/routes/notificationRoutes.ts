import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController';
import { prisma } from '../utils/prisma';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);
router.post('/test', protect, async (req: AuthRequest, res: Response) => {
  const { title, body, data } = req.body;
  const notification = await prisma.notification.create({
    data: {
      userId: req.user!.id,
      title: title || 'Test Notification',
      body: body || 'This is a test',
      data: data || { type: 'test' },
    },
  });
  res.json(notification);
});
export default router;