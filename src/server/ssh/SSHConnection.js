import { Client } from 'ssh2';
import { logger } from '../../utils/ssh/logging.js';

export class SSHConnection {
  constructor(ws) {
    this.ws = ws;
    this.sshClient = new Client();
    this.setupSSHClient();
  }

  setupSSHClient() {
    this.sshClient.on('error', (error) => {
      logger.error('SSH client error:', error);
      this.sendError(error.message);
    });
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(message);
        break;
      case 'command':
        await this.handleCommand(message);
        break;
      default:
        throw new Error('Unknown message type');
    }
  }

  async handleAuth(message) {
    const { credentials } = message;
    
    return new Promise((resolve, reject) => {
      const authTimeout = setTimeout(() => {
        this.sshClient.end();
        reject(new Error('Authentication timeout'));
      }, 30000);

      this.sshClient.on('ready', () => {
        clearTimeout(authTimeout);
        this.sendMessage({
          id: message.id,
          type: 'auth_success'
        });
        resolve();
      });

      const config = {
        host: credentials.host,
        port: 22,
        username: credentials.username,
        password: credentials.password,
        tryKeyboard: true,
        readyTimeout: 30000,
        keepaliveInterval: 10000
      };

      logger.info('Attempting SSH connection:', {
        host: config.host,
        username: config.username
      });

      this.sshClient.connect(config);
    });
  }

  async handleCommand(message) {
    if (!this.sshClient._sock) {
      throw new Error('SSH connection not established');
    }

    this.sshClient.exec(message.command, (err, stream) => {
      if (err) {
        this.sendError(message.id, err.message);
        return;
      }

      let output = '';
      let error = '';

      stream.on('data', (data) => {
        output += data;
        this.sendMessage({
          id: message.id,
          type: 'output',
          data: data.toString()
        });
      });

      stream.stderr.on('data', (data) => {
        error += data;
        this.sendMessage({
          id: message.id,
          type: 'error',
          data: data.toString()
        });
      });

      stream.on('close', (code) => {
        this.sendMessage({
          id: message.id,
          type: 'exit',
          code,
          output,
          error
        });
      });
    });
  }

  sendMessage(message) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendError(id, error) {
    this.sendMessage({
      id,
      type: 'error',
      error
    });
  }

  cleanup() {
    if (this.sshClient) {
      this.sshClient.end();
    }
  }
}