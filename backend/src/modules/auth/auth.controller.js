import { registerSchema, loginSchema } from './auth.validation.js';
import { registerUser, loginUser, getUserProfile } from './auth.service.js';
import { success, error } from '../../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, 'Datos inválidos', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await registerUser(parsed.data);
    return success(res, result, 'Cuenta creada exitosamente', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, 'Datos inválidos', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await loginUser(parsed.data);
    return success(res, result, 'Sesión iniciada correctamente');
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id);
    return success(res, profile);
  } catch (err) {
    next(err);
  }
};