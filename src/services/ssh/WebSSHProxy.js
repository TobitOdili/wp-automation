/**
 * WebSocket proxy for SSH connections
 */
export class WebSSHProxy {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageHandlers = new Map();
    this.connectionTimeout = 15000;
  }

  async connect(credentials) {
    try {
      // Use secure WebSocket proxy instead of direct SSH
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const proxyUrl = `${protocol}//${window.location.host}/ssh-proxy`;

      this.socket = new WebSocket(proxyUrl);
      
      await this._setupConnection();
      await this._authenticate(credentials);
      
      this.connected = true;
      return true;
    } catch (error) {
      this._cleanup();
      throw new Error(`SSH connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    this._cleanup();
    this.connected = false;
  }

  async executeCommand(command) {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      let output = '';
      let error = '';

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Command execution timed out'));
      }, 30000);

      this.messageHandlers.set(messageId, (data) => {
        if (data.type === 'output') {
          output += data.data;
        } else if (data.type === 'error') {
          error += data.data;
        } else if (data.type === 'exit') {
          clearTimeout(timeout);
          this.messageHandlers.delete(messageId);
          
          if (data.code === 0) {
            resolve({ output, error: null, code: 0 });
          } else {
            reject(new Error(error || 'Command failed'));
          }
        }
      });

      this._sendMessage({
        type: 'command',
        id: messageId,
        command
      });
    });
  }

  _setupConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        this._setupMessageHandler();
        resolve();
      };

      this.socket.onclose = () => {
        this._cleanup();
      };

      this.socket.onerror = (error) => {
        reject(new Error('WebSocket error'));
      };
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
        console.error('Error handling message:', error);
      }
    };
  }

  async _authenticate(credentials) {
    return new Promise((resolve, reject) => {
      const messageId = Math.random().toString(36).substring(7);
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(messageId);
        reject(new Error('Authentication timeout'));
      }, 10000);

      this.messageHandlers.set(messageId, (data) => {
        clearTimeout(timeout);
        this.messageHandlers.delete(messageId);
        
        if (data.type === 'auth_success') {
          resolve();
        } else {
          reject(new Error('Authentication failed'));
        }
      });

      this._sendMessage({
        type: 'auth',
        id: messageId,
        credentials: {
          host: credentials.host,
          username: credentials.username,
          password: credentials.password
        }
      });
    });
  }

  _sendMessage(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  _cleanup() {
    this.messageHandlers.clear();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}