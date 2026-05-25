import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createVisitRequest, getMyVisitRequests, getMyVisitBookings, updateVisitStatus } from '../controllers/visitController';

const router = Router();
router.post('/', protect, createVisitRequest);
router.get('/requests', protect, getMyVisitRequests);
router.get('/bookings', protect, getMyVisitBookings);
router.put('/:id', protect, updateVisitStatus);
export default router;