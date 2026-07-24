// src/utils/slugify.js

// Convierte un texto en slug: minúsculas, sin tildes, espacios -> guiones
export const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // quita caracteres especiales
    .replace(/\s+/g, '-') // espacios -> guiones
    .replace(/-+/g, '-'); // colapsa guiones repetidos
};