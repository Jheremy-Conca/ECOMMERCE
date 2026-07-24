// src/modules/cart/cart.validation.js
import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().uuid('productId debe ser un UUID válido'),
  quantity: z.coerce.number().int().min(1, 'La cantidad mínima es 1').default(1),
});

export const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'La cantidad mínima es 1'),
});