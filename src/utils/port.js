import { createServer } from 'net';
import { logger } from './ssh/logging.js';

export function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer()
      .listen(port, () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

export async function findAvailablePort(startPort, endPort = startPort + 100) {
  logger.info(`Finding available port starting from ${startPort}...`);
  
  for (let port = startPort; port <= endPort; port++) {
    if (await checkPortAvailable(port)) {
      logger.info(`Found available port: ${port}`);
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${endPort}`);
}