import { SSHConnection } from './SSHConnection';
import { SSHMessageHandler } from './SSHMessageHandler';
import { SSHWebSocket } from './SSHWebSocket';
import { generateId } from '../../utils/id';

export class SSHClient {
  constructor() {
    this.connection = null;
    this.messageHandler = new SSHMessageHandler();
    this.webSocket = null;
  }

  async connect(credentials) {
    try {
      // Validate and store connection info
      this.connection = new SSHConnection(
        credentials.host,
        credentials.username,
        credentials.password
      );
      this.connection.validate();

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ssh-proxy`;
      
      this.webSocket = new SSHWebSocket(wsUrl);
      this.webSocket.setMessageHandler(this.messageHandler);
      
      // Connect and authenticate
      await this.webSocket.connect();
      await this.authenticate();

      return true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  async authenticate() {
    const messageId = generateId();
    const connectionInfo = this.connection.getConnectionInfo();

    return this.messageHandler.addHandler(
      messageId,
      (message) => {
        if (message.type === 'auth_success') {
          return { complete: true, data: true };
        }
        if (message.type === 'error') {
          throw new Error(message.error || 'Authentication failed');
        }
      },
      10000 // 10 second timeout for auth
    ).then(() => {
      this.webSocket.send({
        type: 'auth',
        id: messageId,
        credentials: connectionInfo
      });
    });
  }

  async executeCommand(command) {
    if (!this.webSocket?.isConnected()) {
      throw new Error('Not connected to SSH server');
    }

    const messageId = generateId();
    let output = '';
    let error = '';

    return this.messageHandler.addHandler(
      messageId,
      (message) => {
        switch (message.type) {
          case 'output':
            output += message.data;
            break;
          case 'error':
            error += message.data;
            break;
          case 'exit':
            if (message.code === 0) {
              return { complete: true, data: { output, error: null, code: 0 }};
            }
            throw new Error(error || 'Command failed');
        }
      }
    ).then(() => {
      this.webSocket.send({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  disconnect() {
    this.cleanup();
  }

  cleanup() {
    this.connection = null;
    this.messageHandler.clear();
    this.webSocket?.cleanup();
    this.webSocket = null;
  }
}