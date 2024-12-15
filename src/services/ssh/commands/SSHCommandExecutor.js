import { SSHError } from '../errors/SSHError';

export class SSHCommandExecutor {
  constructor(connection) {
    this.connection = connection;
  }

  async execute(command) {
    if (!this.connection.isConnected()) {
      throw new SSHError('Not connected to SSH server');
    }

    try {
      return await this.connection.executeCommand(command);
    } catch (error) {
      throw new SSHError(`Command execution failed: ${error.message}`);
    }
  }
}