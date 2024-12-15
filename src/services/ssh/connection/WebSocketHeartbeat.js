import { logger } from '../../../utils/ssh/logging.js';
import { SSH_CONFIG } from '../../../utils/ssh/config.js';

export class WebSocketHeartbeat {
  constructor(webSocket) {
    this.webSocket = webSocket;
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  start() {
    this.pingInterval = setInterval(() => {
      if (this.webSocket.isConnected()) {
        this.webSocket.socket.send('ping');
        
        this.pongTimeout = setTimeout(() => {
          logger.warn('Pong timeout - connection may be dead');
          this.webSocket.socket.close();
        }, SSH_CONFIG.WEBSOCKET.PONG_TIMEOUT);
      }
    }, SSH_CONFIG.WEBSOCKET.PING_INTERVAL);
  }

  handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  stop() {
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