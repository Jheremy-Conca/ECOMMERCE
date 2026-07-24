// src/modules/checkout/checkout.service.js
import prisma from '../../config/db.js';
import stripe from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { generateInvoiceForOrder } from './invoice.service.js';

// Resuelve la dirección del pedido: reutiliza una guardada (validando que sea del usuario)
// o crea una nueva, según lo que haya mandado el cliente (validado en checkout.validation.js)
const resolveAddress = async (userId, { addressId, address }) => {
  if (addressId) {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new Error('La dirección indicada no existe o no te pertenece');
    }
    return existing;
  }
  return prisma.address.create({ data: { ...address, userId } });
};

export const createCheckoutSession = async (userId, data) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Revalida stock al momento de pagar: pudo cambiar desde que se agregó al carrito
  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new Error(`"${item.product.name}" ya no está disponible`);
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Solo hay ${item.product.stock} unidades disponibles de "${item.product.name}"`);
    }
  }

  const address = await resolveAddress(userId, data);
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: address.id,
      total,
      status: 'PENDING',
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productSku: item.product.sku,
          unitPrice: item.product.price,
          quantity: item.quantity,
        })),
      },
      payment: {
        create: {
          status: 'PENDING',
          method: 'stripe',
          amount: total,
        },
      },
    },
    include: { items: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: 'pen',
        product_data: { name: item.product.name },
        unit_amount: Math.round(Number(item.product.price) * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: order.id },
    success_url: `${env.frontendUrl}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/checkout/cancelado`,
  });

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { reference: session.id },
  });

  return { url: session.url, orderId: order.id };
};

// Se ejecuta solo cuando Stripe confirma el pago real vía webhook — nunca desde la redirección del navegador
export const confirmOrderFromSession = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === 'PAID') return; // ya procesado o no existe: idempotente

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: 'APPROVED', reference: session.payment_intent },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    }),
    ...order.items
      .filter((item) => item.productId)
      .map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
  ]);

  const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // La boleta se genera aparte, fuera de la transacción crítica: si falla,
  // el pago y el descuento de stock ya quedaron confirmados igual.
  try {
    await generateInvoiceForOrder(orderId);
  } catch (err) {
    console.error('Error generando la boleta para el pedido', orderId, ':', err.message);
  }
};

// Verifica que el pedido exista y pertenezca al usuario logueado (o que sea admin)
export const getOrderWithOwnershipCheck = async (orderId, user) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new Error('Pedido no encontrado');
  }

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('No tenés permiso para ver este pedido');
  }

  return order;
};