/**
 * Manages SSH connection state and operations
 */
export class SSHConnection {
  constructor(host, username, password) {
    this.host = host;
    this.username = username; 
    this.password = password;
    this.connected = false;
    this.retryAttempts = 3;
    this.retryDelay = 2000;
    this.connectionTimeout = 60000; // Increased to 60 seconds
  }

  validate() {
    if (!this.host || !this.username || !this.password) {
      throw new Error('Missing required SSH credentials');
    }

    if (!this.isValidHost(this.host)) {
      throw new Error('Invalid host address');
    }
  }

  isValidHost(host) {
    // IP address validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Hostname validation  
    const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
    
    return ipRegex.test(host) || hostnameRegex.test(host);
  }

  getConnectionInfo() {
    return {
      host: this.host,
      port: 22,
      username: this.username,
      password: this.password,
      readyTimeout: this.connectionTimeout,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
      tryKeyboard: true, // Support keyboard-interactive auth
      algorithms: {
        kex: [
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521',
          'diffie-hellman-group-exchange-sha256',
          'diffie-hellman-group14-sha1'
        ],
        cipher: [
          'aes128-ctr',
          'aes192-ctr',
          'aes256-ctr',
          'aes128-gcm',
          'aes256-gcm'
        ]
      }
    };
  }
}