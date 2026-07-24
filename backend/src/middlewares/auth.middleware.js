import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { error } from "../utils/apiResponse.js";
import prisma from "../config/db.js";

// Verifica el JWT del header Authorization y adjunta el usuario a req.user
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "No autorizado: token no proporcionado", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { role: true },
    });

    if (!user) {
      return error(res, "No autorizado: el usuario ya no existe", 401);
    }
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
    }; 
    next();

  } catch (err) {
    return error(res, "No autorizado: token inválido o expirado", 401);
  }
};

// Uso: router.get('/admin-only', authMiddleware, requireRole('admin'), handler)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, "Prohibido: no tienes permisos para esta acción", 403);
    }
    next();
  };
};
