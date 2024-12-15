import { logger } from '../../utils/ssh/logging.js';
import { validateCredentials } from '../../utils/ssh/validation.js';
import { SSH_CONFIG } from '../../utils/ssh/config.js';

export class SSHAuthenticator {
  constructor(webSocket, messageHandler) {
    this.webSocket = webSocket;
    this.messageHandler = messageHandler;
    this.authTimeout = SSH_CONFIG.CONNECTION.TIMEOUT;
  }

  async authenticate(credentials) {
    try {
      logger.info('Starting SSH authentication...');
      validateCredentials(credentials);

      const messageId = this._generateMessageId();
      
      return await this._waitForAuthentication(messageId, credentials);
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }

  async _waitForAuthentication(messageId, credentials) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.messageHandler.removeHandler(messageId);
        reject(new Error('Authentication timeout'));
      }, this.authTimeout);

      this.messageHandler.addHandler(messageId, (message) => {
        if (message.type === 'auth_success') {
          clearTimeout(timeoutId);
          logger.info('Authentication successful');
          return { complete: true, data: true };
        }
        if (message.type === 'error') {
          clearTimeout(timeoutId);
          throw new Error(message.error || 'Authentication failed');
        }
      });

      this._sendAuthRequest(messageId, credentials);
    });
  }

  _sendAuthRequest(messageId, credentials) {
    logger.debug('Sending authentication request');
    this.webSocket.send({
      type: 'auth',
      id: messageId,
      credentials: {
        host: credentials.host,
        username: credentials.username,
        password: credentials.password,
        port: SSH_CONFIG.CONNECTION.PORT,
        keepaliveInterval: SSH_CONFIG.CONNECTION.KEEPALIVE_INTERVAL,
        readyTimeout: SSH_CONFIG.CONNECTION.TIMEOUT
      }
    });
  }

  _generateMessageId() {
    return Math.random().toString(36).substring(7);
  }
}