import { ApiRouter, RouteDefinition } from '@core/routes/index.js';
import { authMiddleware, optionalAuthMiddleware } from '@core/middleware/auth.js';
import { generateToken } from '@core/utils/auth.js';
import { userModel } from '@models/user.js';
import { z } from 'zod';

const router = new ApiRouter('v1');

// Login route - no auth required
const login: RouteDefinition = {
  path: '/login',
  method: 'post',
  handler: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // In a real app, you would verify the password
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username
      });
      
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  }
};

// Protected route - auth required
const protectedRoute: RouteDefinition = {
  path: '/protected',
  method: 'get',
  handler: [
    authMiddleware, // Apply auth middleware
    (req, res) => {
      // This route will only be reached if auth is successful
      res.json({
        message: 'This is a protected route',
        user: req.user
      });
    }
  ]
};

// Optional auth route - works with or without auth
const optionalAuthRoute: RouteDefinition = {
  path: '/optional-auth',
  method: 'get',
  handler: [
    optionalAuthMiddleware, // Apply optional auth middleware
    (req, res) => {
      if (req.user) {
        // User is authenticated
        res.json({
          message: 'You are authenticated',
          user: req.user
        });
      } else {
        // User is not authenticated
        res.json({
          message: 'You are not authenticated',
          note: 'Some features may be limited'
        });
      }
    }
  ]
};

// Register routes
router.addRoute(login);
router.addRoute(protectedRoute);
router.addRoute(optionalAuthRoute);

export default router; 