import { logger } from '../../utils/ssh/logging.js';

export class WebSSHClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 3;
    this.reconnectDelay = 2000;
    this.connectionTimeout = 30000;
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  async connect(credentials) {
    try {
      // Use relative path for WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ssh-proxy`;

      this.socket = new WebSocket(wsUrl);
      
      await this._waitForConnection();
      await this._authenticate(credentials);
      
      this._setupHeartbeat();
      this._setupMessageHandler();
      
      this.connected = true;
      return true;
    } catch (error) {
      this.cleanup();
      throw new Error(`SSH connection failed: ${error.message}`);
    }
  }

  async executeCommand(command) {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      let output = '';
      let error = '';

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Command execution timed out'));
      }, 30000);

      this.messageHandlers.set(messageId, (message) => {
        try {
          if (message.type === 'output') {
            output += message.data;
          } else if (message.type === 'error') {
            error += message.data;
          } else if (message.type === 'exit') {
            clearTimeout(timeout);
            this.messageHandlers.delete(messageId);
            
            if (message.code === 0) {
              resolve({ output, error: null, code: 0 });
            } else {
              reject(new Error(error || 'Command failed'));
            }
          }
        } catch (err) {
          logger.error('Error handling command response:', err);
        }
      });

      this._sendMessage({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  async _waitForConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.socket.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };
    });
  }

  async _authenticate(credentials) {
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 30000);

      this.messageHandlers.set(messageId, (message) => {
        clearTimeout(timeout);
        if (message.type === 'auth_success') {
          resolve();
        } else if (message.type === 'error') {
          reject(new Error(message.error));
        }
      });

      this._sendMessage({
        type: 'auth',
        id: messageId,
        credentials
      });
    });
  }

  _setupMessageHandler() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handler = this.messageHandlers.get(message.id);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    };
  }

  _setupHeartbeat() {
    // Send ping every 30 seconds
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this._sendMessage({ type: 'ping' });
        
        this.pongTimeout = setTimeout(() => {
          logger.warn('Pong timeout - reconnecting...');
          this.cleanup();
          this.connect();
        }, 5000);
      }
    }, 30000);

    // Handle pong responses
    this.socket.onmessage = (event) => {
      if (event.data === 'pong') {
        clearTimeout(this.pongTimeout);
      }
    };
  }

  _sendMessage(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    this.messageHandlers.clear();
  }
}