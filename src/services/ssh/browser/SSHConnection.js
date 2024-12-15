import { SSHWebSocket } from './SSHWebSocket';
import { SSHConnectionState } from '../core/SSHConnectionState';
import { SSHError } from '../core/SSHError';
import { logger } from '../../../utils/ssh/logging';

export class SSHConnection {
  constructor() {
    this.state = new SSHConnectionState();
    this.webSocket = new SSHWebSocket();
    this.messageHandlers = new Map();
  }

  async connect(credentials) {
    try {
      logger.info('Establishing SSH connection...');
      this.state.setState(SSHConnectionState.States.CONNECTING);
      
      logger.debug('Connecting to WebSocket...');
      await this.webSocket.connect();
      
      logger.debug('Setting up message handler...');
      this.webSocket.setMessageHandler(this._handleMessage.bind(this));
      
      logger.info('Authenticating...');
      await this._authenticate(credentials);
      
      logger.info('Connection established successfully');
      this.state.setState(SSHConnectionState.States.CONNECTED);
      return true;
    } catch (error) {
      logger.error('Connection failed:', error);
      this.state.setState(SSHConnectionState.States.ERROR, error);
      throw error;
    }
  }

  async executeCommand(command) {
    if (!this.isConnected()) {
      logger.error('Not connected to SSH server');
      throw new SSHError('Not connected to SSH server');
    }

    logger.debug('Executing command:', command);
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      let output = '';

      const timeout = setTimeout(() => {
        this._removeMessageHandler(messageId);
        logger.error('Command execution timeout');
        reject(new SSHError('Command execution timeout'));
      }, 30000);

      this._addMessageHandler(messageId, (message) => {
        if (message.type === 'output') {
          output += message.data;
          logger.debug('Received command output chunk');
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          logger.error('Command error:', message.error);
          reject(new SSHError(message.error));
        } else if (message.type === 'exit') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          logger.debug('Command completed successfully');
          resolve(output);
        }
      });

      logger.debug('Sending command message...');
      this.webSocket.send({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  disconnect() {
    logger.info('Disconnecting SSH connection');
    this.webSocket.close();
    this.state.setState(SSHConnectionState.States.DISCONNECTED);
  }

  isConnected() {
    return this.state.isConnected() && this.webSocket.isConnected();
  }

  _handleMessage(message) {
    logger.debug('Received message:', message.type);
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler(message);
    }
  }

  _addMessageHandler(messageId, handler) {
    logger.debug('Adding message handler:', messageId);
    this.messageHandlers.set(messageId, handler);
  }

  _removeMessageHandler(messageId) {
    logger.debug('Removing message handler:', messageId);
    this.messageHandlers.delete(messageId);
  }

  async _authenticate(credentials) {
    logger.info('Starting SSH authentication...');
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      
      const timeout = setTimeout(() => {
        this._removeMessageHandler(messageId);
        logger.error('Authentication timeout');
        reject(new SSHError('Authentication timeout'));
      }, 30000);

      this._addMessageHandler(messageId, (message) => {
        if (message.type === 'auth_success') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          logger.info('Authentication successful');
          resolve();
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          logger.error('Authentication failed:', message.error);
          reject(new SSHError(message.error));
        }
      });

      logger.debug('Sending authentication request...');
      this.webSocket.send({
        type: 'auth',
        id: messageId,
        credentials
      });
    });
  }
}