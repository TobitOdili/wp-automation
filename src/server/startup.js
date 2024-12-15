import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from '../utils/ssh/logging.js';
import { findAvailablePort } from '../utils/port.js';

export async function createServers(app) {
  try {
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Create WebSocket server
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/ssh-proxy'
    });

    // Find available port starting from 3001
    const port = await findAvailablePort(3001);
    logger.info(`Starting server on port ${port}...`);

    return { httpServer, wss, port };
  } catch (error) {
    logger.error('Failed to create servers:', error);
    throw error;
  }
}

export function setupShutdownHandlers(servers) {
  const { httpServer, wss } = servers;

  const cleanup = async () => {
    logger.info('Server shutting down...');
    
    // Close WebSocket connections
    wss.clients.forEach(client => {
      try {
        client.close();
      } catch (err) {
        logger.error('Error closing WebSocket client:', err);
      }
    });

    try {
      await new Promise((resolve) => wss.close(resolve));
      await new Promise((resolve) => httpServer.close(resolve));
      logger.info('Server shutdown complete');
    } catch (err) {
      logger.error('Error during shutdown:', err);
    }

    // Force exit after 5 seconds
    setTimeout(() => {
      logger.warn('Forcing process exit after timeout');
      process.exit(1);
    }, 5000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    cleanup();
  });

  process.on('unhandledRejection', (error) => {
    logger.error('Unhandled rejection:', error);
    cleanup();
  });
}