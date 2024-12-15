/**
 * Browser-side SSH client implementation
 */
import { SSHConnection } from './SSHConnection';
import { SSHEventEmitter } from '../core/SSHEventEmitter';
import { logger } from '../../../utils/ssh/logging';

export class SSHClient extends SSHEventEmitter {
  constructor() {
    super();
    this.connection = new SSHConnection();
  }

  async connect(credentials) {
    try {
      this.emit('connecting');
      await this.connection.connect(credentials);
      this.emit('connected');
      return true;
    } catch (error) {
      logger.error('Connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async executeCommand(command) {
    try {
      this.emit('executing', command);
      const output = await this.connection.executeCommand(command);
      this.emit('executed', output);
      return output;
    } catch (error) {
      logger.error('Command execution failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    this.connection.disconnect();
    this.emit('disconnected');
  }

  isConnected() {
    return this.connection.isConnected();
  }
}