// src/modules/orders/orders.service.js
import prisma from '../../config/db.js';

export const getOrdersByUser = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      invoiceNumber: true,
      invoiceUrl: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  return orders;
};

export const getOrderById = async (orderId, user) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      userId: true,
    },
  });

  if (!order) {
    const err = new Error('Pedido no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = order.userId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('No tenés permiso para ver este pedido');
    err.statusCode = 403;
    throw err;
  }

  const { userId, ...publicOrder } = order;
  return publicOrder;
};

export const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      invoiceNumber: true,
      invoiceUrl: true,
      user: {
        select: { fullName: true, email: true },
      },
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  return orders.map(({ user, ...order }) => ({
    ...order,
    customerName: user?.fullName ?? 'Usuario eliminado',
  }));
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    const err = new Error('Pedido no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};