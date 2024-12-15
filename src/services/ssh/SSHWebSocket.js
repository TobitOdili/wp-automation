/**
 * Manages WebSocket connection for SSH proxy
 */
export class SSHWebSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.messageHandler = null;
    this.reconnectAttempts = 3;
    this.reconnectDelay = 2000;
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  async connect(timeout = 30000) { // Increased timeout
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.cleanup();
        reject(new Error('Connection timeout'));
      }, timeout);

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          clearTimeout(timeoutId);
          this._setupHeartbeat();
          resolve();
        };

        this.socket.onclose = async (event) => {
          if (!event.wasClean) {
            await this._handleDisconnect();
          }
          this.cleanup();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeoutId);
          reject(new Error('WebSocket connection failed'));
        };

        this.socket.onmessage = (event) => {
          if (event.data === 'pong') {
            clearTimeout(this.pongTimeout);
            return;
          }

          try {
            const message = JSON.parse(event.data);
            this.messageHandler?.handleMessage(message);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async _handleDisconnect() {
    for (let attempt = 1; attempt <= this.reconnectAttempts; attempt++) {
      try {
        await this.connect();
        console.log('Reconnected successfully');
        return;
      } catch (error) {
        if (attempt === this.reconnectAttempts) {
          console.error('Failed to reconnect after', attempt, 'attempts');
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
        this.reconnectDelay *= 2; // Exponential backoff
      }
    }
  }

  _setupHeartbeat() {
    // Send ping every 30 seconds
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.socket.send('ping');
        
        // Set pong timeout
        this.pongTimeout = setTimeout(() => {
          console.warn('Pong timeout - connection may be dead');
          this.socket.close();
        }, 5000);
      }
    }, 30000);
  }

  setMessageHandler(handler) {
    this.messageHandler = handler;
  }

  send(message) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }
    this.socket.send(JSON.stringify(message));
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
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
  }
}