import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { id: string; role: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
  } catch {
    return null;
  }
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: { email: string; password?: string; name: string; googleId?: string }) => {
  return await prisma.user.create({ data });
};