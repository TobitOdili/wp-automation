import { NodeSSH } from 'node-ssh';

export class SSHService {
  constructor() {
    this.ssh = new NodeSSH();
    this.connected = false;
  }

  async connect(config) {
    try {
      await this.ssh.connect({
        host: config.host,
        username: config.username,
        password: config.password,
        port: config.port || 22
      });
      this.connected = true;
      return true;
    } catch (error) {
      throw new Error(`SSH connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.ssh.dispose();
      this.connected = false;
    }
  }

  async executeCommand(command) {
    if (!this.connected) {
      throw new Error('SSH connection not established');
    }

    try {
      const result = await this.ssh.execCommand(command);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
      };
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  async executeWPCLI(command, path = '/var/www/html') {
    return this.executeCommand(`cd ${path} && wp ${command}`);
  }
}