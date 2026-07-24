// src/modules/categories/categories.routes.js
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware.js';
import {
  listCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller.js';

const router = Router();

// Rutas públicas
router.get('/', listCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Rutas privadas (solo admin)
router.post('/', authMiddleware, requireRole('admin'), createCategory);
router.patch('/:id', authMiddleware, requireRole('admin'), updateCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategory);

export default router;