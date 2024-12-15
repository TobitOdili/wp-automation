import { logger } from '../../../utils/ssh/logging.js';
import { SSHConnectionState } from './SSHConnectionState.js';
import { SSHMessage } from '../messaging/SSHMessage.js';
import { validateCredentials } from '../../../utils/ssh/validation.js';

export class SSHAuthenticator {
  constructor(webSocket, messageHandler, connectionState) {
    this.webSocket = webSocket;
    this.messageHandler = messageHandler;
    this.connectionState = connectionState;
    this.authTimeout = 30000; // 30 seconds
  }

  async authenticate(credentials) {
    try {
      validateCredentials(credentials);
      this.connectionState.setState(SSHConnectionState.States.AUTHENTICATING);

      const messageId = Math.random().toString(36).substring(7);
      return await this._waitForAuthentication(messageId, credentials);
    } catch (error) {
      this.connectionState.setState(SSHConnectionState.States.ERROR, error);
      throw error;
    }
  }

  async _waitForAuthentication(messageId, credentials) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.messageHandler.removeHandler(messageId);
        const error = new Error('Authentication timeout');
        this.connectionState.setState(SSHConnectionState.States.ERROR, error);
        reject(error);
      }, this.authTimeout);

      this.messageHandler.addHandler(messageId, (message) => {
        if (SSHMessage.isAuthSuccess(message)) {
          clearTimeout(timeoutId);
          this.connectionState.setState(SSHConnectionState.States.AUTHENTICATED);
          return { complete: true, data: true };
        }

        if (SSHMessage.isError(message)) {
          clearTimeout(timeoutId);
          const error = new Error(SSHMessage.getErrorMessage(message));
          this.connectionState.setState(SSHConnectionState.States.ERROR, error);
          throw error;
        }
      });

      this._sendAuthRequest(messageId, credentials);
    });
  }

  _sendAuthRequest(messageId, credentials) {
    logger.debug('Sending authentication request');
    const authRequest = SSHMessage.createAuthRequest(messageId, credentials);
    this.webSocket.send(authRequest);
  }
}