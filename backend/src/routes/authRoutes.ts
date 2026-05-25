import { Router } from 'express';
import { register, login, googleLogin, forgotPassword } from '../controllers/authController';
import { registerValidation } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
export default router;