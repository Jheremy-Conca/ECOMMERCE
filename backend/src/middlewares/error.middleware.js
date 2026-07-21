import { logger } from '../utils/logger.js';
import { error } from '../utils/apiResponse.js';

export const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return error(res, message, statusCode);
};