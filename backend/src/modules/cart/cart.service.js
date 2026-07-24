// src/modules/cart/cart.service.js
import prisma from '../../config/db.js';

const cartInclude = {
  items: {
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  },
};

// Todo carrito se crea automáticamente al primer uso (Cart es 1:1 con User)
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId }, include: cartInclude });
  }
  return cart;
};

// Suma total del carrito calculada en cada respuesta (no se persiste, siempre refleja precios actuales)
const withTotal = (cart) => {
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  return { ...cart, total };
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return withTotal(cart);
};

export const addItem = async (userId, { productId, quantity }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new Error('El producto no existe o no está disponible');
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.productId === productId);
  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (newQuantity > product.stock) {
    throw new Error(`Solo hay ${product.stock} unidades disponibles de "${product.name}"`);
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, productId, quantity: newQuantity },
  });

  return getCart(userId);
};

export const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) {
    throw new Error('Ese producto no está en el carrito');
  }

  if (quantity > item.product.stock) {
    throw new Error(`Solo hay ${item.product.stock} unidades disponibles de "${item.product.name}"`);
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });

  return getCart(userId);
};

export const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) {
    throw new Error('Ese producto no está en el carrito');
  }

  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  return getCart(userId);
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
};