import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createReport } from '../controllers/adminController';

const router = Router();

router.post('/', protect, createReport);

export default router;
