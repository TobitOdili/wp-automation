import { SSHMessageTypes } from './SSHMessageTypes.js';

/**
 * Factory for creating SSH protocol messages
 */
export class SSHMessageFactory {
  static createAuthRequest(messageId, credentials) {
    return {
      type: SSHMessageTypes.AUTH_REQUEST,
      id: messageId,
      credentials: {
        host: credentials.host,
        username: credentials.username,
        password: credentials.password
      }
    };
  }

  static createCommandRequest(messageId, command) {
    return {
      type: SSHMessageTypes.COMMAND,
      id: messageId,
      command
    };
  }

  static createPing() {
    return {
      type: SSHMessageTypes.PING
    };
  }

  static createPong() {
    return {
      type: SSHMessageTypes.PONG
    };
  }
}