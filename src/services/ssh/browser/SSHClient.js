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
      logger.info('Initiating SSH connection...');
      this.emit('connecting');
      
      logger.debug('Connection details:', {
        host: credentials.host,
        username: credentials.username,
        hasPassword: !!credentials.password
      });

      await this.connection.connect(credentials);
      logger.info('SSH connection established');
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
      logger.info('Executing command:', command);
      this.emit('executing', command);
      
      const output = await this.connection.executeCommand(command);
      logger.debug('Command output:', output);
      
      this.emit('executed', output);
      return output;
    } catch (error) {
      logger.error('Command execution failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    logger.info('Disconnecting SSH client');
    this.connection.disconnect();
    this.emit('disconnected');
  }

  isConnected() {
    return this.connection.isConnected();
  }
}