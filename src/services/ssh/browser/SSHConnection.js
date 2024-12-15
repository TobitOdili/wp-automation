/**
 * Browser-side SSH connection implementation
 */
import { SSHWebSocket } from './SSHWebSocket';
import { SSHConnectionState } from '../core/SSHConnectionState';
import { SSHError } from '../core/SSHError';
import { SSHConfig } from '../core/SSHConfig';
import { logger } from '../../../utils/ssh/logging';

export class SSHConnection {
  constructor() {
    this.state = new SSHConnectionState();
    this.webSocket = new SSHWebSocket();
    this.messageHandlers = new Map();
  }

  async connect(credentials) {
    try {
      this.state.setState(SSHConnectionState.States.CONNECTING);
      await this.webSocket.connect();
      this.webSocket.setMessageHandler(this._handleMessage.bind(this));
      await this._authenticate(credentials);
      this.state.setState(SSHConnectionState.States.CONNECTED);
      return true;
    } catch (error) {
      this.state.setState(SSHConnectionState.States.ERROR, error);
      throw error;
    }
  }

  async executeCommand(command) {
    if (!this.isConnected()) {
      throw new SSHError('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      let output = '';

      const timeout = setTimeout(() => {
        this._removeMessageHandler(messageId);
        reject(new SSHError('Command execution timeout'));
      }, SSHConfig.connection.timeout);

      this._addMessageHandler(messageId, (message) => {
        if (message.type === 'output') {
          output += message.data;
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          reject(new SSHError(message.error));
        } else if (message.type === 'exit') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          resolve(output);
        }
      });

      this.webSocket.send({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  disconnect() {
    this.webSocket.close();
    this.state.setState(SSHConnectionState.States.DISCONNECTED);
  }

  isConnected() {
    return this.state.isConnected() && this.webSocket.isConnected();
  }

  _handleMessage(message) {
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler(message);
    }
  }

  _addMessageHandler(messageId, handler) {
    this.messageHandlers.set(messageId, handler);
  }

  _removeMessageHandler(messageId) {
    this.messageHandlers.delete(messageId);
  }

  async _authenticate(credentials) {
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      
      const timeout = setTimeout(() => {
        this._removeMessageHandler(messageId);
        reject(new SSHError('Authentication timeout'));
      }, SSHConfig.auth.timeout);

      this._addMessageHandler(messageId, (message) => {
        if (message.type === 'auth_success') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          resolve();
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          this._removeMessageHandler(messageId);
          reject(new SSHError(message.error));
        }
      });

      this.webSocket.send({
        type: 'auth',
        id: messageId,
        credentials
      });
    });
  }
}