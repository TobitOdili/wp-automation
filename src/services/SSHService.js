import SSHClient from '../cli/ssh-client.js';
import { logger } from '../utils/ssh/logging.js';

export class SSHService {
  constructor() {
    this.client = new SSHClient();
  }

  async connect(credentials) {
    try {
      logger.info('Connecting to SSH server...');
      await this.client.connect(
        credentials.host,
        credentials.username,
        credentials.password
      );
      logger.info('SSH connection established');
      return true;
    } catch (error) {
      logger.error('SSH connection failed:', error);
      throw error;
    }
  }

  async executeCommand(command) {
    try {
      logger.info('Executing command:', command);
      const output = await this.client.executeCommand(command);
      logger.info('Command executed successfully');
      return output;
    } catch (error) {
      logger.error('Command execution failed:', error);
      throw error;
    }
  }

  disconnect() {
    try {
      this.client.disconnect();
      logger.info('SSH connection closed');
    } catch (error) {
      logger.error('Error disconnecting:', error);
    }
  }
}