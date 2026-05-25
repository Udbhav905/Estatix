import { Router } from 'express';
import { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty } from '../controllers/propertyController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.route('/').get(getProperties).post(protect, upload.array('images', 10), createProperty);
router.route('/:id').get(getPropertyById).put(protect, updateProperty).delete(protect, deleteProperty);
export default router;