import { logger } from '../../utils/ssh/logging.js';
import { SSH_CONFIG } from '../../utils/ssh/config.js';

export class SSHWebSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.messageHandler = null;
    this.reconnectAttempts = SSH_CONFIG.WEBSOCKET.RECONNECT_ATTEMPTS;
    this.reconnectDelay = SSH_CONFIG.WEBSOCKET.RECONNECT_DELAY;
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  async connect(timeout = SSH_CONFIG.CONNECTION.TIMEOUT) {
    logger.info('Initiating WebSocket connection...');
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.cleanup();
        reject(new Error('Connection timeout'));
      }, timeout);

      try {
        this.socket = new WebSocket(this.url);
        this._setupSocketHandlers(timeoutId, resolve, reject);
      } catch (error) {
        clearTimeout(timeoutId);
        this.cleanup();
        reject(error);
      }
    });
  }

  _setupSocketHandlers(timeoutId, resolve, reject) {
    this.socket.onopen = () => {
      clearTimeout(timeoutId);
      this._setupHeartbeat();
      logger.info('WebSocket connection established');
      resolve();
    };

    this.socket.onclose = async (event) => {
      logger.info('WebSocket connection closed', event.wasClean ? 'cleanly' : 'unexpectedly');
      if (!event.wasClean) {
        await this._handleDisconnect();
      }
      this.cleanup();
    };

    this.socket.onerror = (error) => {
      logger.error('WebSocket error:', error);
      clearTimeout(timeoutId);
      reject(new Error('WebSocket connection failed'));
    };

    this.socket.onmessage = this._handleMessage.bind(this);
  }

  _handleMessage(event) {
    try {
      if (event.data === 'pong') {
        clearTimeout(this.pongTimeout);
        return;
      }

      const message = JSON.parse(event.data);
      logger.debug('Received message:', message);
      this.messageHandler?.handleMessage(message);
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  send(message) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const messageStr = JSON.stringify(message);
    logger.debug('Sending message:', message);
    this.socket.send(messageStr);
  }

  setMessageHandler(handler) {
    this.messageHandler = handler;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  _setupHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.send('ping');
        
        this.pongTimeout = setTimeout(() => {
          logger.warn('Pong timeout - connection may be dead');
          this.socket.close();
        }, SSH_CONFIG.WEBSOCKET.PONG_TIMEOUT);
      }
    }, SSH_CONFIG.WEBSOCKET.PING_INTERVAL);
  }

  async _handleDisconnect() {
    for (let attempt = 1; attempt <= this.reconnectAttempts; attempt++) {
      try {
        logger.info(`Reconnection attempt ${attempt}/${this.reconnectAttempts}`);
        await this.connect();
        logger.info('Reconnected successfully');
        return;
      } catch (error) {
        if (attempt === this.reconnectAttempts) {
          logger.error('Failed to reconnect after all attempts');
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
        this.reconnectDelay *= 2; // Exponential backoff
      }
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
    logger.info('WebSocket connection cleaned up');
  }
}