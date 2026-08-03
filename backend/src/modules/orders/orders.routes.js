// src/modules/orders/orders.routes.js
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware.js';
import { listOrders, getOrder, listAllOrders, updateStatus } from './orders.controller.js';

const router = Router();

// Rutas fijas antes que las de :orderId, mismo criterio ya usado en este módulo
router.get('/admin', authMiddleware, requireRole('admin'), listAllOrders);
router.patch('/:orderId/status', authMiddleware, requireRole('admin'), updateStatus);

router.get('/', authMiddleware, listOrders);
router.get('/:orderId', authMiddleware, getOrder);

export default router;