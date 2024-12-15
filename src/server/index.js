import { createApp } from './app.js';
import { createServers, setupShutdownHandlers } from './startup.js';
import { logger } from '../utils/ssh/logging.js';
import { setupSSHProxy } from './ssh/sshProxy.js';

async function startServer() {
  try {
    // Create Express app
    const app = createApp();

    // Create and configure servers
    const servers = await createServers(app);
    
    // Setup SSH proxy
    setupSSHProxy(servers.wss);

    // Setup shutdown handlers
    setupShutdownHandlers(servers);

    // Start listening
    await new Promise((resolve, reject) => {
      servers.httpServer
        .listen(servers.port)
        .once('listening', () => {
          logger.info(`Server running on port ${servers.port}`);
          logger.info(`Environment: ${process.env.NODE_ENV}`);
          resolve();
        })
        .once('error', reject);
    });

    return servers;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});