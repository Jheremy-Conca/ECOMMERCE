// src/modules/orders/orders.controller.js
import { success, error } from '../../utils/apiResponse.js';
import * as ordersService from './orders.service.js';

export const listOrders = async (req, res) => {
  try {
    const orders = await ordersService.getOrdersByUser(req.user.id);
    return success(res, orders, 'Pedidos obtenidos');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.orderId, req.user);
    return success(res, order, 'Pedido obtenido');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};


export const listAllOrders = async (req, res) => {
  try {
    const orders = await ordersService.getAllOrders();
    return success(res, orders, 'Pedidos obtenidos');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return error(res, 'status es requerido', 400);
    }
    const order = await ordersService.updateOrderStatus(req.params.orderId, status);
    return success(res, order, 'Estado del pedido actualizado');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};