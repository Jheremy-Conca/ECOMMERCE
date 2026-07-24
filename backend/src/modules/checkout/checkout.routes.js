// src/modules/checkout/checkout.routes.js
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { createCheckoutSession } from './checkout.controller.js';

const router = Router();

router.post('/', authMiddleware, createCheckoutSession);

export default router;