import { Router } from 'express';
import { sshRoutes } from './ssh/routes.js';

export function setupRoutes(app) {
  const router = Router();

  // Mount SSH routes
  router.use('/api/ssh', sshRoutes);

  // Mount the router
  app.use(router);
}