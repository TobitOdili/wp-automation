import { logger } from '../../../utils/ssh/logging';
import { SSHEventEmitter } from '../core/SSHEventEmitter';
import { SSHConnection } from './SSHConnection';

export class WebSocketSSHClient extends SSHEventEmitter {
  constructor() {
    super();
    this.connection = new SSHConnection();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.connection.on('stateChange', ({ state, error }) => {
      logger.debug('Connection state changed:', state);
      
      switch (state) {
        case 'connecting':
          this.emit('connecting');
          break;
        case 'connected':
          this.emit('connected');
          break;
        case 'error':
          this.emit('error', error);
          break;
        case 'disconnected':
          this.emit('disconnected');
          break;
      }
    });
  }

  async connect(credentials) {
    try {
      logger.info('WebSocket SSH client connecting...');
      await this.connection.connect(credentials);
      return true;
    } catch (error) {
      logger.error('WebSocket SSH connection failed:', error);
      throw error;
    }
  }

  async executeCommand(command) {
    try {
      logger.info('Executing command via WebSocket:', command);
      this.emit('executing', command);
      
      const output = await this.connection.executeCommand(command);
      
      logger.debug('Command executed successfully');
      this.emit('executed', output);
      return output;
    } catch (error) {
      logger.error('Command execution failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    logger.info('Disconnecting WebSocket SSH client');
    this.connection.disconnect();
  }

  isConnected() {
    return this.connection.isConnected();
  }
}