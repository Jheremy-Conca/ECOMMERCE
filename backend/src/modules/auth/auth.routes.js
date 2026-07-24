import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, me } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Limita intentos de registro/login para mitigar ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos, intenta de nuevo más tarde', errors: null },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authMiddleware, me);

export default router;