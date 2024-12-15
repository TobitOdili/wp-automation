import express from 'express';
import { corsMiddleware, errorHandler } from './middleware/index.js';
import { setupRoutes } from './routes/index.js';
import { setupStaticServing } from './middleware/static.js';

export function createApp() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(corsMiddleware);

  // Setup API routes first
  setupRoutes(app);

  // Setup static file serving and SPA fallback
  setupStaticServing(app);

  // Error handling - must be last
  app.use(errorHandler);

  return app;
}