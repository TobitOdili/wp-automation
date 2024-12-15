/**
 * Custom SSH error classes
 */
export class SSHError extends Error {
  constructor(message, code = 'SSH_ERROR') {
    super(message);
    this.name = 'SSHError';
    this.code = code;
  }
}

export class SSHConnectionError extends SSHError {
  constructor(message) {
    super(message, 'SSH_CONNECTION_ERROR');
    this.name = 'SSHConnectionError';
  }
}

export class SSHAuthenticationError extends SSHError {
  constructor(message) {
    super(message, 'SSH_AUTH_ERROR');
    this.name = 'SSHAuthenticationError';
  }
}

export class SSHCommandError extends SSHError {
  constructor(message, command) {
    super(message, 'SSH_COMMAND_ERROR');
    this.name = 'SSHCommandError';
    this.command = command;
  }
}