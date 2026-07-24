// src/modules/checkout/checkout.validation.js
import { z } from 'zod';

const newAddressSchema = z.object({
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  isDefault: z.boolean().optional().default(false),
});

// El cliente manda O un addressId ya guardado, O los datos para crear una dirección nueva — nunca ambos ni ninguno
export const createCheckoutSchema = z
  .object({
    addressId: z.string().uuid().optional(),
    address: newAddressSchema.optional(),
  })
  .refine((data) => !!data.addressId !== !!data.address, {
    message: 'Debes enviar addressId (dirección guardada) o address (dirección nueva), no ambos ni ninguno',
  });