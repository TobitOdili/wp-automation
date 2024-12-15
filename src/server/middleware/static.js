import { join } from 'path';
import express from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export function setupStaticServing(app) {
  if (config.isProduction) {
    logger.info('Setting up production static file serving');
    
    // Serve static files from dist directory
    app.use(express.static(config.paths.dist));

    // SPA fallback - must be after API routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(join(config.paths.dist, 'index.html'));
    });
  } else {
    // Development mode - let Vite handle static serving
    app.get('/', (req, res) => {
      res.redirect('http://localhost:5173');
    });
  }
}