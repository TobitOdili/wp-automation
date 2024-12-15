export class SSHMessage {
  static MessageTypes = {
    AUTH_REQUEST: 'auth',
    AUTH_SUCCESS: 'auth_success',
    COMMAND: 'command',
    OUTPUT: 'output',
    ERROR: 'error',
    EXIT: 'exit'
  };

  static createAuthRequest(messageId, credentials) {
    return {
      type: this.MessageTypes.AUTH_REQUEST,
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
      type: this.MessageTypes.COMMAND,
      id: messageId,
      command
    };
  }

  static isAuthSuccess(message) {
    return message.type === this.MessageTypes.AUTH_SUCCESS;
  }

  static isError(message) {
    return message.type === this.MessageTypes.ERROR;
  }

  static isOutput(message) {
    return message.type === this.MessageTypes.OUTPUT;
  }

  static isExit(message) {
    return message.type === this.MessageTypes.EXIT;
  }

  static getErrorMessage(message) {
    return message.error || 'Unknown error occurred';
  }
}