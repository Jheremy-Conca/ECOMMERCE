import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = '7d';

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    { sub: user.id, role: user.role.name },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRATION }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role.name,
    },
  };
};

export const registerUser = async ({ email, password, fullName, phone }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Ya existe una cuenta con este email');
    err.statusCode = 409;
    throw err;
  }

  // Todo registro público entra como 'cliente'. El rol 'admin' se asigna manualmente (seed o panel).
  const clienteRole = await prisma.role.findUnique({ where: { name: 'cliente' } });
  if (!clienteRole) {
    const err = new Error('El rol "cliente" no existe todavía. Corre el seed primero.');
    err.statusCode = 500;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      phone,
      roleId: clienteRole.id,
    },
    include: { role: true },
  });

  return buildAuthResponse(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // Mensaje genérico a propósito: no revelar si el email existe o no
  if (!user) {
    const err = new Error('Email o contraseña incorrectos');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const err = new Error('Email o contraseña incorrectos');
    err.statusCode = 401;
    throw err;
  }

  return buildAuthResponse(user);
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role.name,
  };
};