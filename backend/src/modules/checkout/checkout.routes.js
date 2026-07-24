// src/modules/checkout/checkout.routes.js
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { createCheckoutSession, getOrderInvoice } from './checkout.controller.js';

const router = Router();

router.post('/', authMiddleware, createCheckoutSession);
router.get('/orders/:orderId/invoice', authMiddleware, getOrderInvoice);

export default router;