import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import { logger } from '../../utils/ssh/logging.js';

export class SSHProxyServer {
  constructor(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ssh-proxy',
      perMessageDeflate: false,
      clientTracking: true
    });
    this.clients = new Map();
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      logger.info('New WebSocket connection');
      const clientId = Math.random().toString(36).substring(7);
      const sshClient = new Client();
      
      this.clients.set(clientId, { ws, sshClient });

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(clientId, message);
        } catch (error) {
          logger.error('Message handling error:', error);
          this.sendError(ws, message?.id, error.message);
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed');
        this.cleanup(clientId);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.cleanup(clientId);
      });

      // Setup ping/pong with more frequent checks
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });
    });

    // More frequent heartbeat checks
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          logger.warn('Client heartbeat timeout');
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 15000); // Check every 15 seconds

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  async handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { ws, sshClient } = client;

    switch (message.type) {
      case 'auth':
        await this.handleAuth(ws, sshClient, message);
        break;
      case 'command':
        await this.handleCommand(ws, sshClient, message);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        throw new Error('Unknown message type');
    }
  }

  async handleAuth(ws, sshClient, message) {
    const { credentials } = message;
    
    return new Promise((resolve, reject) => {
      const authTimeout = setTimeout(() => {
        sshClient.end();
        reject(new Error('Authentication timeout'));
      }, 120000); // Increased to 120 seconds

      sshClient.on('ready', () => {
        clearTimeout(authTimeout);
        this.sendMessage(ws, {
          id: message.id,
          type: 'auth_success'
        });
        resolve();
      });

      sshClient.on('error', (error) => {
        clearTimeout(authTimeout);
        logger.error('SSH connection error:', error);
        this.sendError(ws, message.id, `SSH connection failed: ${error.message}`);
        reject(error);
      });

      const config = {
        host: credentials.host,
        port: 22,
        username: credentials.username,
        password: credentials.password,
        tryKeyboard: true,
        readyTimeout: 120000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 10,
        debug: (msg) => logger.debug('SSH Debug:', msg)
      };

      logger.info('Attempting SSH connection:', { host: config.host, username: config.username });
      sshClient.connect(config);
    });
  }

  async handleCommand(ws, sshClient, message) {
    if (!sshClient._sock) {
      throw new Error('SSH connection not established');
    }

    sshClient.exec(message.command, (err, stream) => {
      if (err) {
        this.sendError(ws, message.id, err.message);
        return;
      }

      let output = '';
      let error = '';

      stream.on('data', (data) => {
        output += data;
        this.sendMessage(ws, {
          id: message.id,
          type: 'output',
          data: data.toString()
        });
      });

      stream.stderr.on('data', (data) => {
        error += data;
        this.sendMessage(ws, {
          id: message.id,
          type: 'error',
          data: data.toString()
        });
      });

      stream.on('close', (code) => {
        this.sendMessage(ws, {
          id: message.id,
          type: 'exit',
          code,
          output,
          error
        });
      });

      stream.on('error', (err) => {
        this.sendError(ws, message.id, err.message);
      });
    });
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, id, error) {
    this.sendMessage(ws, {
      id,
      type: 'error',
      error
    });
  }

  cleanup(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      const { sshClient } = client;
      if (sshClient) {
        sshClient.end();
      }
      this.clients.delete(clientId);
    }
  }

  cleanupAll() {
    this.clients.forEach((client, id) => {
      this.cleanup(id);
    });
    this.wss.close();
  }
}