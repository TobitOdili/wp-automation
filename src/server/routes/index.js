import { Router } from 'express';
import { apiRouter } from './api.js';
import { sshRouter } from './ssh.js';
import { config } from '../config/index.js';

export function setupRoutes(app) {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      environment: config.env,
      timestamp: new Date().toISOString()
    });
  });

  // Mount route modules
  router.use('/ssh', sshRouter);
  router.use('/', apiRouter);

  // Mount all API routes under /api
  app.use('/api', router);

  return router;
}