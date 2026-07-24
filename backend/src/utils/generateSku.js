import crypto from 'crypto';

// Genera un SKU legible: PREFIJO-CODIGO (ej: ROP-4K9X2A)
export const generateSku = (categorySlug) => {
  const prefix = categorySlug
    .replace(/-/g, '')
    .slice(0, 3)
    .toUpperCase();

  const code = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();

  return `${prefix}-${code}`;
};