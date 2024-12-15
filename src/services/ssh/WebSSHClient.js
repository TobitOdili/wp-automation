/**
 * Web-based SSH client implementation using secure WebSocket
 */
export class WebSSHClient {
  constructor() {
    this.connected = false;
    this.socket = null;
    this.connectionTimeout = 15000; // 15 seconds timeout
    this.pingInterval = null;
  }

  async connect(credentials) {
    try {
      if (!credentials.host || !credentials.username || !credentials.password) {
        throw new Error('SSH credentials missing (host, username, or password)');
      }

      // Validate IP address format
      if (!this._isValidIpAddress(credentials.host)) {
        throw new Error('Invalid IP address format');
      }

      // Use secure WebSocket with standard SSH port
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${credentials.host}:22/ssh`;

      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);
      
      // Set up connection handlers
      await this._setupConnectionHandlers();
      
      // Wait for connection
      await this._waitForConnection();

      // Send authentication
      await this._authenticate(credentials);

      // Setup keep-alive ping
      this._setupKeepAlive();

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
    if (!this.connected || !this.socket) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      let output = '';
      let error = '';
      let timeout;

      const commandId = Math.random().toString(36).substring(7);

      // Set command timeout
      timeout = setTimeout(() => {
        this.socket.removeEventListener('message', messageHandler);
        reject(new Error('Command execution timed out'));
      }, 30000);

      const messageHandler = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          // Only process responses for this command
          if (response.id !== commandId) return;

          if (response.type === 'output') {
            output += response.data;
          } else if (response.type === 'error') {
            error += response.data;
          } else if (response.type === 'exit') {
            clearTimeout(timeout);
            this.socket.removeEventListener('message', messageHandler);
            
            if (response.code === 0) {
              resolve({ output, error: null, code: 0 });
            } else {
              reject(new Error(error || 'Command failed'));
            }
          }
        } catch (err) {
          console.error('Error parsing command response:', err);
        }
      };

      this.socket.addEventListener('message', messageHandler);

      // Send command with ID
      this.socket.send(JSON.stringify({ 
        type: 'command',
        id: commandId,
        data: command 
      }));
    });
  }

  _isValidIpAddress(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  _setupConnectionHandlers() {
    return new Promise((resolve) => {
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        resolve();
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this._cleanup();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this._cleanup();
      };
    });
  }

  _waitForConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);

      const checkConnection = () => {
        if (this.socket.readyState === WebSocket.OPEN) {
          clearTimeout(timeout);
          resolve();
        } else if (this.socket.readyState === WebSocket.CLOSED || 
                   this.socket.readyState === WebSocket.CLOSING) {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  async _authenticate(credentials) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      const authHandler = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.type === 'auth_success') {
            clearTimeout(timeout);
            this.socket.removeEventListener('message', authHandler);
            resolve();
          } else if (response.type === 'auth_failure') {
            clearTimeout(timeout);
            this.socket.removeEventListener('message', authHandler);
            reject(new Error('Authentication failed'));
          }
        } catch (err) {
          console.error('Error parsing auth response:', err);
        }
      };

      this.socket.addEventListener('message', authHandler);

      // Send authentication request
      this.socket.send(JSON.stringify({
        type: 'auth',
        username: credentials.username,
        password: credentials.password
      }));
    });
  }

  _setupKeepAlive() {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  _cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}