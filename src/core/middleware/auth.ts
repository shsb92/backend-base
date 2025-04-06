import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
      };
    }
  }
}

export interface JwtPayload {
  id: number;
  email: string;
  username: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

// Optional auth middleware that doesn't throw an error if no token is provided
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    // Just continue without authentication
    next();
  }
}; 