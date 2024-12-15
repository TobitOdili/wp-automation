import { WebSocketServer } from 'ws';
import { SSHManager } from './SSHManager.js';
import { logger } from '../../utils/ssh/logging.js';

export function setupSSHProxy(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ssh-proxy',
    perMessageDeflate: false
  });

  const sshManager = new SSHManager();

  wss.on('connection', (ws) => {
    const connectionId = Math.random().toString(36).substring(7);
    logger.info(`New WebSocket connection (${connectionId})`);

    sshManager.createConnection(connectionId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        
        switch (message.type) {
          case 'connect':
            await sshManager.connect(connectionId, message.credentials);
            break;
          case 'disconnect':
            sshManager.cleanup(connectionId);
            break;
          default:
            throw new Error('Unknown message type');
        }
      } catch (error) {
        logger.error(`Message handling error (${connectionId}):`, error);
        sshManager.sendError(ws, error.message);
      }
    });

    ws.on('close', () => {
      logger.info(`WebSocket connection closed (${connectionId})`);
      sshManager.cleanup(connectionId);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error (${connectionId}):`, error);
      sshManager.cleanup(connectionId);
    });
  });

  // Cleanup on server shutdown
  server.on('close', () => {
    sshManager.cleanupAll();
  });

  return sshManager;
}