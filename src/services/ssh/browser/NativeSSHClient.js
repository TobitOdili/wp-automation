import { logger } from '../../../utils/ssh/logging';
import { SSHEventEmitter } from '../core/SSHEventEmitter';

export class NativeSSHClient extends SSHEventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.connected = false;
  }

  async connect(credentials) {
    try {
      logger.info('Attempting native SSH connection...');
      
      // Check if native SSH is supported
      if (!this._isNativeSSHSupported()) {
        logger.info('Native SSH not supported, falling back to WebSocket');
        throw new Error('NATIVE_SSH_NOT_SUPPORTED');
      }

      // Try native SSH connection
      this.emit('connecting');
      logger.debug('Opening native SSH connection...', {
        host: credentials.host,
        username: credentials.username
      });

      // Use the native SSH API if available
      this.socket = await window.navigator.ssh.openConnection({
        host: credentials.host,
        username: credentials.username,
        password: credentials.password,
        port: 22
      });

      logger.info('Native SSH connection established');
      this.connected = true;
      this.emit('connected');
      return true;
    } catch (error) {
      if (error.message === 'NATIVE_SSH_NOT_SUPPORTED') {
        logger.info('Falling back to WebSocket SSH implementation');
        throw error; // Let the caller handle the fallback
      }
      
      logger.error('Native SSH connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async executeCommand(command) {
    if (!this.connected || !this.socket) {
      logger.error('Not connected to SSH server');
      throw new Error('Not connected to SSH server');
    }

    try {
      logger.info('Executing command:', command);
      this.emit('executing', command);

      const result = await this.socket.execute(command);
      
      logger.debug('Command completed successfully');
      this.emit('executed', result);
      return result;
    } catch (error) {
      logger.error('Command execution failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      logger.info('Disconnecting native SSH connection');
      this.socket.close();
      this.socket = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  _isNativeSSHSupported() {
    const hasNativeSSH = !!(window.navigator && window.navigator.ssh);
    logger.debug('Native SSH support:', hasNativeSSH);
    return hasNativeSSH;
  }
}