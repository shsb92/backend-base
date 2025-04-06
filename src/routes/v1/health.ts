import { ApiRouter, RouteDefinition } from '@core/routes/index.js';
import pool from '@core/database/connection.js';

const router = new ApiRouter('v1');

const healthCheck: RouteDefinition = {
  path: '/health',
  method: 'get',
  handler: async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({
        status: 'healthy',
        version: 'v1',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        version: 'v1',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  }
};

router.addRoute(healthCheck);

export default router; 