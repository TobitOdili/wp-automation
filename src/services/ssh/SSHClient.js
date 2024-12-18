import { SSHConnection } from './connection/SSHConnection';
import { SSHCommandExecutor } from './commands/SSHCommandExecutor';
import { SSHEventEmitter } from './events/SSHEventEmitter';

export class SSHClient extends SSHEventEmitter {
  constructor() {
    super();
    this.connection = new SSHConnection();
    this.commandExecutor = new SSHCommandExecutor(this.connection);
  }

  async connect(credentials) {
    try {
      this.emit('connecting');
      await this.connection.connect(credentials);
      this.emit('connected');
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async executeCommand(command) {
    try {
      this.emit('executing', command);
      const result = await this.commandExecutor.execute(command);
      this.emit('executed', result);
      return result;
    } catch (error) {
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