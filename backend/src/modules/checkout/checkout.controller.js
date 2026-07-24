// src/modules/checkout/checkout.controller.js
import { success, error } from '../../utils/apiResponse.js';
import stripe from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { createCheckoutSchema } from './checkout.validation.js';
import * as checkoutService from './checkout.service.js';
import * as invoiceService from './invoice.service.js';

export const createCheckoutSession = async (req, res) => {
  try {
    const parsed = createCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const result = await checkoutService.createCheckoutSession(req.user.id, parsed.data);
    return success(res, result, 'Sesión de pago creada');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const getOrderInvoice = async (req, res) => {
  try {
    const order = await checkoutService.getOrderWithOwnershipCheck(req.params.orderId, req.user);
    const result = await invoiceService.generateInvoiceForOrder(order.id); // idempotente: si ya existe, la devuelve tal cual
    return success(res, { invoiceUrl: result.invoiceUrl, invoiceNumber: result.invoiceNumber }, 'Boleta lista');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// IMPORTANTE: este handler necesita el body crudo (sin parsear), no JSON —
// ver nota de montaje en app.js junto a webhook.routes.js
export const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await checkoutService.confirmOrderFromSession(event.data.object);
    } catch (err) {
      console.error('Error procesando checkout.session.completed:', err.message);
      // Devolvemos 200 igual: Stripe reintenta si respondemos error, y no queremos
      // reintentos infinitos por un bug nuestro. El log queda para revisar a mano.
    }
  }

  res.json({ received: true });
};