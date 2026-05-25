import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getConversations, getMessages, markAsRead } from '../controllers/chatController';

const router = Router();
router.get('/conversations', protect, getConversations);
router.get('/messages/:propertyId/:otherUserId', protect, getMessages);
router.put('/messages/:messageId/read', protect, markAsRead);
export default router;