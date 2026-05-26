import { Router } from 'express';
import { register, login, googleLogin, forgotPassword, getMe } from '../controllers/authController';
import { registerValidation } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { protect } from '../middleware/auth';

const router = Router();
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
export default router;