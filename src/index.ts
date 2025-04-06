import express from 'express';
import dotenv from 'dotenv';
import { RouterRegistry } from '@core/routes/index.js';
import v1HealthRouter from './routes/v1/health.js';
import v1UsersRouter from './routes/v1/users.js';
import v1AuthExamplesRouter from './routes/v1/auth-examples.js';
import { errorHandler, notFoundHandler } from '@core/middleware/error-handler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Register routes
const registry = RouterRegistry.getInstance();
registry.registerRouter('v1', v1HealthRouter);
registry.registerRouter('v1', v1UsersRouter);
registry.registerRouter('v1', v1AuthExamplesRouter);

// Mount versioned routes
const routers = registry.getRouters();
routers.forEach((router, version) => {
  app.use(`/api/${version}`, router.getRouter());
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the TypeScript Node.js Backend!',
    versions: Array.from(routers.keys())
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available API versions:', Array.from(routers.keys()));
});

export { app }; 