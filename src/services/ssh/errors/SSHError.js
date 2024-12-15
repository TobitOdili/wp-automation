export class SSHError extends Error {
  constructor(message, code = 'SSH_ERROR') {
    super(message);
    this.name = 'SSHError';
    this.code = code;
  }
}

export class SSHConnectionError extends SSHError {
  constructor(message) {
    super(message, 'CONNECTION_ERROR');
    this.name = 'SSHConnectionError';
  }
}

export class SSHCommandError extends SSHError {
  constructor(message) {
    super(message, 'COMMAND_ERROR');
    this.name = 'SSHCommandError';
  }
}