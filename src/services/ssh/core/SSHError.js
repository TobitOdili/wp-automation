/**
 * Custom SSH error types
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