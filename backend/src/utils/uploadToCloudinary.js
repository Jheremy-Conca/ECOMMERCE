// src/utils/uploadToCloudinary.js
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

// Sube un buffer (archivo en memoria) a Cloudinary y devuelve la URL segura
export const uploadBufferToCloudinary = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Sube varios buffers en paralelo y devuelve el array de URLs
export const uploadMultipleToCloudinary = async (files, folder = 'products') => {
  const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer, folder));
  return Promise.all(uploads);
};

// Extrae el public_id de una URL de Cloudinary y la elimina (para al borrar/editar un producto)
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    const parts = imageUrl.split('/');
    const fileWithExt = parts[parts.length - 1];
    const publicId = `${parts[parts.length - 2]}/${fileWithExt.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // No bloqueamos la operación principal si falla el borrado de una imagen vieja
    console.error('Error al eliminar imagen de Cloudinary:', err.message);
  }
};

// Sube un buffer de PDF a Cloudinary como recurso "raw" (no imagen) y devuelve la URL segura
export const uploadRawToCloudinary = (buffer, folder = 'invoices', publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: publicId, // ej: invoiceNumber, para que la URL sea predecible
        format: 'pdf',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};