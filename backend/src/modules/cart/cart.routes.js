// src/modules/cart/cart.routes.js
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { getCart, addItem, updateItemQuantity, removeItem, clearCart } from './cart.controller.js';

const router = Router();

// Todas las rutas del carrito requieren estar logueado: es el carrito propio del usuario
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItemQuantity);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;