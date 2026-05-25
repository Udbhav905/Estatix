import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import { getPendingProperties, approveProperty, rejectProperty, banUser, getReports, resolveReport } from '../controllers/adminController';

const router = Router();
router.use(protect, adminOnly);
router.get('/properties/pending', getPendingProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.put('/users/:id/ban', banUser);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
export default router;