// src/modules/products/products.routes.js
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware.js';
import { uploadImages } from '../../middlewares/upload.middleware.js';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  addProductImages,
  removeProductImage,
  deleteProduct,
  listProductsAdminHandler,
} from './products.controller.js';

const router = Router();

// Ruta admin fija — DEBE ir antes de /:id, o Express la matchea ahí con id="admin"
router.get('/admin', authMiddleware, requireRole('admin'), listProductsAdminHandler);

// Rutas públicas (catálogo)
router.get('/', listProducts);
router.get('/:id', getProductById);

// Rutas privadas (solo admin)
router.post('/', authMiddleware, requireRole('admin'), uploadImages, createProduct);
router.patch('/:id', authMiddleware, requireRole('admin'), updateProduct);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProduct);

router.post('/:id/images', authMiddleware, requireRole('admin'), uploadImages, addProductImages);
router.delete('/:id/images', authMiddleware, requireRole('admin'), removeProductImage);

export default router;