import { Client } from 'ssh2';
import { logger } from '../../utils/ssh/logging.js';
import { config } from '../config/index.js';

export class SSHManager {
  constructor() {
    this.connections = new Map();
  }

  createConnection(id, ws) {
    const client = new Client();
    const connection = {
      client,
      ws,
      authenticated: false
    };

    this.setupClientEvents(id, connection);
    this.connections.set(id, connection);
    return connection;
  }

  setupClientEvents(id, connection) {
    const { client, ws } = connection;

    client.on('ready', () => {
      connection.authenticated = true;
      this.sendMessage(ws, {
        type: 'status',
        status: 'connected'
      });
    });

    client.on('error', (error) => {
      logger.error(`SSH connection error (${id}):`, error);
      this.sendError(ws, error.message);
    });

    client.on('end', () => {
      logger.info(`SSH connection ended (${id})`);
      this.cleanup(id);
    });
  }

  async connect(id, credentials) {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, config.ssh.timeout);

      connection.client.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      connection.client.connect({
        host: credentials.host,
        port: 22,
        username: credentials.username,
        password: credentials.password,
        readyTimeout: config.ssh.timeout,
        keepaliveInterval: config.ssh.keepaliveInterval
      });
    });
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      error: error.toString()
    });
  }

  cleanup(id) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.client.end();
      this.connections.delete(id);
    }
  }

  cleanupAll() {
    this.connections.forEach((connection, id) => {
      this.cleanup(id);
    });
  }
}