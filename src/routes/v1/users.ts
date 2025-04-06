import { ApiRouter, RouteDefinition } from '@core/routes/index.js';
import { userModel } from '@models/user.js';
import { z } from 'zod';

const router = new ApiRouter('v1');

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8)
});

// Routes
const getUsers: RouteDefinition = {
  path: '/users',
  method: 'get',
  handler: async (req, res) => {
    const users = await userModel.findAll();
    res.json(users);
  }
};

const getUserById: RouteDefinition = {
  path: '/users/:id',
  method: 'get',
  handler: async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = await userModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  }
};

const createUser: RouteDefinition = {
  path: '/users',
  method: 'post',
  handler: async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);
      
      // In a real app, you would hash the password
      const userData = {
        email: data.email,
        username: data.username,
        password_hash: data.password, // This should be hashed in production
        is_active: true
      };
      
      const user = await userModel.create(userData);
      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: 'Error creating user' });
    }
  }
};

// Register routes
router.addRoute(getUsers);
router.addRoute(getUserById);
router.addRoute(createUser);

export default router; 