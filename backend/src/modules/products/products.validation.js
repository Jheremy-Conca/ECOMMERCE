// src/modules/products/products.validation.js
import { z } from 'zod';

// multipart/form-data llega como strings, por eso coerce en price/stock
export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0).optional().default(0),
  categoryId: z.string().uuid('categoryId debe ser un UUID válido'),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  categoryId: z.string().uuid().optional(),
  search: z.string().min(1).optional(),
});