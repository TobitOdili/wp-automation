import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from '../utils/ssh/logging.js';
import { findAvailablePort } from '../utils/port.js';

export async function createServers(app) {
  try {
    // Find available port starting from 3001
    const port = await findAvailablePort(3001);
    logger.info(`Starting server on port ${port}...`);

    // Create HTTP server
    const httpServer = createServer(app);

    // Create WebSocket server
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/ssh-proxy'
    });

    logger.info('WebSocket server created');

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
        logger.debug('Closed WebSocket client connection');
      } catch (err) {
        logger.error('Error closing WebSocket client:', err);
      }
    });

    // Close servers
    await Promise.all([
      new Promise(resolve => wss.close(resolve)),
      new Promise(resolve => httpServer.close(resolve))
    ]);

    logger.info('Server shutdown complete');
    process.exit(0);
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