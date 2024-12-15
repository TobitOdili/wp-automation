import { logger } from '../../utils/ssh/logging';

export class WebSSHClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageHandlers = new Map();
    this.connectionTimeout = 30000;
  }

  async connect(credentials) {
    try {
      // Use relative WebSocket URL
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ssh-proxy`;
      
      logger.info('Connecting to WebSocket proxy:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      await this._waitForConnection();
      await this._authenticate(credentials);

      this.connected = true;
      return true;
    } catch (error) {
      logger.error('Connection failed:', error);
      this.cleanup();
      throw error;
    }
  }

  async _waitForConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      this.socket.onopen = () => {
        logger.info('WebSocket connection established');
        clearTimeout(timeout);
        this._setupMessageHandler();
        resolve();
      };

      this.socket.onerror = (event) => {
        logger.error('WebSocket error:', event);
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };

      this.socket.onclose = () => {
        logger.info('WebSocket connection closed');
        this.cleanup();
      };
    });
  }

  _setupMessageHandler() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        logger.debug('Received message:', message);
        
        const handler = this.messageHandlers.get(message.id);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    };
  }

  async _authenticate(credentials) {
    logger.info('Authenticating with SSH server');
    
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Authentication timeout'));
      }, this.connectionTimeout);

      this.messageHandlers.set(messageId, (message) => {
        clearTimeout(timeout);
        this.messageHandlers.delete(messageId);
        
        if (message.type === 'auth_success') {
          logger.info('Authentication successful');
          resolve();
        } else if (message.type === 'error') {
          reject(new Error(message.error || 'Authentication failed'));
        }
      });

      this._sendMessage({
        type: 'auth',
        id: messageId,
        credentials
      });
    });
  }

  async executeCommand(command) {
    if (!this.connected) {
      throw new Error('Not connected to SSH server');
    }

    logger.info('Executing command:', command);

    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      let output = '';
      let error = '';

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Command execution timeout'));
      }, this.connectionTimeout);

      this.messageHandlers.set(messageId, (message) => {
        switch (message.type) {
          case 'output':
            output += message.data;
            break;
          case 'error':
            error += message.data;
            break;
          case 'exit':
            clearTimeout(timeout);
            this.messageHandlers.delete(messageId);
            
            if (message.code === 0) {
              resolve({ output, error: null, code: 0 });
            } else {
              reject(new Error(error || 'Command failed'));
            }
            break;
        }
      });

      this._sendMessage({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  _sendMessage(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    logger.debug('Sending message:', message);
    this.socket.send(JSON.stringify(message));
  }

  cleanup() {
    logger.info('Cleaning up WebSocket connection');
    
    this.messageHandlers.clear();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
  }
}