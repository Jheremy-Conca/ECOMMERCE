// src/middlewares/upload.middleware.js
import multer from 'multer';

// Guarda los archivos en memoria (buffer) para subirlos directo a Cloudinary sin escribir a disco
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Formato de imagen no permitido (solo jpg, png, webp)'), false);
  }
  cb(null, true);
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB por imagen, máx 5 imágenes
}).array('images', 5);