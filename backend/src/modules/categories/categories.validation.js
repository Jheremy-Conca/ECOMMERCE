// src/modules/categories/categories.validation.js
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  parentId: z.string().uuid('parentId debe ser un UUID válido').optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  parentId: z.string().uuid('parentId debe ser un UUID válido').optional().nullable(),
});