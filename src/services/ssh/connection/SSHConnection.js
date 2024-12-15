import { SSHConnectionState } from './SSHConnectionState';
import { SSHError } from '../errors/SSHError';
import SSHClient from '../../../cli/ssh-client';

export class SSHConnection {
  constructor() {
    this.state = new SSHConnectionState();
    this.client = new SSHClient();
  }

  async connect(credentials) {
    try {
      this.state.setState('connecting');

      if (!this._validateCredentials(credentials)) {
        throw new SSHError('Invalid credentials');
      }

      await this.client.connect(
        credentials.host,
        credentials.username,
        credentials.password
      );

      this.state.setState('connected');
      return true;
    } catch (error) {
      this.state.setState('error', error);
      throw new SSHError(error.message);
    }
  }

  async executeCommand(command) {
    if (!this.client || !this.isConnected()) {
      throw new SSHError('Not connected to SSH server');
    }

    try {
      return await this.client.executeCommand(command);
    } catch (error) {
      throw new SSHError(`Command execution failed: ${error.message}`);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.disconnect();
    }
    this.state.setState('disconnected');
  }

  isConnected() {
    return this.state.getState() === 'connected';
  }

  _validateCredentials(credentials) {
    return credentials?.host && 
           credentials?.username && 
           credentials?.password;
  }
}