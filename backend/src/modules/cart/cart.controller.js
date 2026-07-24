// src/modules/cart/cart.controller.js
import { success, error } from '../../utils/apiResponse.js';
import { addItemSchema, updateItemSchema } from './cart.validation.js';
import * as cartService from './cart.service.js';

export const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return success(res, cart);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const addItem = async (req, res) => {
  try {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const cart = await cartService.addItem(req.user.id, parsed.data);
    return success(res, cart, 'Producto agregado al carrito');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, parsed.error.errors[0].message, 400);
    }

    const cart = await cartService.updateItemQuantity(
      req.user.id,
      req.params.productId,
      parsed.data.quantity
    );
    return success(res, cart, 'Cantidad actualizada');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const removeItem = async (req, res) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.productId);
    return success(res, cart, 'Producto eliminado del carrito');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return success(res, cart, 'Carrito vaciado');
  } catch (err) {
    return error(res, err.message, 400);
  }
};