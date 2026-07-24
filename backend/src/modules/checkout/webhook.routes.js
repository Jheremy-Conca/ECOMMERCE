// src/modules/checkout/webhook.routes.js
// Ruta separada a propósito: Stripe necesita el body CRUDO (sin parsear a JSON)
// para poder verificar la firma. Debe montarse en app.js ANTES de express.json().
import { Router } from 'express';
import express from 'express';
import { stripeWebhook } from './checkout.controller.js';

const router = Router();

router.post('/', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;