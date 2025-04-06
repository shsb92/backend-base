import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth.js';

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}; 