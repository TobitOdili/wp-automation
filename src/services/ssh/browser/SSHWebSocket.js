/**
 * WebSocket connection handler for SSH
 */
import { SSHConfig } from '../core/SSHConfig';
import { SSHError } from '../core/SSHError';
import { logger } from '../../../utils/ssh/logging';

export class SSHWebSocket {
  constructor() {
    this.socket = null;
    this.messageHandler = null;
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${SSHConfig.websocket.path}`;
      
      this.socket = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        reject(new SSHError('WebSocket connection timeout'));
      }, SSHConfig.connection.timeout);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        this._setupHeartbeat();
        resolve();
      };

      this.socket.onerror = (error) => {
        clearTimeout(timeout);
        reject(new SSHError('WebSocket connection failed'));
      };

      this.socket.onclose = () => {
        this._cleanup();
      };
    });
  }

  setMessageHandler(handler) {
    this.messageHandler = handler;
    if (this.socket) {
      this.socket.onmessage = (event) => {
        try {
          if (event.data === 'pong') {
            this._handlePong();
            return;
          }
          const message = JSON.parse(event.data);
          this.messageHandler(message);
        } catch (error) {
          logger.error('Error handling message:', error);
        }
      };
    }
  }

  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new SSHError('WebSocket not connected');
    }
    this.socket.send(JSON.stringify(message));
  }

  close() {
    this._cleanup();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  _setupHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.send('ping');
        this._setupPongTimeout();
      }
    }, SSHConfig.websocket.pingInterval);
  }

  _setupPongTimeout() {
    this.pongTimeout = setTimeout(() => {
      logger.warn('WebSocket heartbeat timeout');
      this.close();
    }, SSHConfig.websocket.pongTimeout);
  }

  _handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  _cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }
}