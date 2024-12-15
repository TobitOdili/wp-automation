#!/usr/bin/env node
import { spawn } from 'child_process';
import { createInterface } from 'readline';

class SSHClient {
  constructor() {
    this.sshProcess = null;
    this.connected = false;
  }

  connect(host, username, password) {
    return new Promise((resolve, reject) => {
      // Use expect script to handle SSH authentication
      const expect = spawn('expect', ['-c', `
        set timeout 30
        spawn ssh ${username}@${host}
        expect {
          "password:" {
            send "${password}\\r"
            expect "$ "
            send "echo Connected\\r"
          }
          timeout { exit 1 }
          eof { exit 2 }
        }
        expect "Connected"
        interact
      `]);

      expect.stdout.on('data', (data) => {
        if (data.includes('Connected')) {
          this.connected = true;
          this.sshProcess = expect;
          resolve(true);
        }
      });

      expect.stderr.on('data', (data) => {
        reject(new Error(`SSH Error: ${data}`));
      });

      expect.on('close', (code) => {
        if (code !== 0 && !this.connected) {
          reject(new Error(`SSH process exited with code ${code}`));
        }
      });
    });
  }

  async executeCommand(command) {
    if (!this.connected || !this.sshProcess) {
      throw new Error('Not connected to SSH server');
    }

    return new Promise((resolve, reject) => {
      const output = [];
      const commandWithMarkers = `echo "START_OUTPUT"; ${command}; echo "END_OUTPUT"`;
      
      this.sshProcess.stdin.write(`${commandWithMarkers}\n`);
      
      const outputHandler = (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.includes('START_OUTPUT')) {
            output.length = 0; // Clear previous output
          } else if (line.includes('END_OUTPUT')) {
            resolve(output.join('\n'));
            return;
          } else {
            output.push(line);
          }
        }
      };

      this.sshProcess.stdout.on('data', outputHandler);
      
      // Set timeout
      const timeout = setTimeout(() => {
        this.sshProcess.stdout.removeListener('data', outputHandler);
        reject(new Error('Command execution timeout'));
      }, 30000);
    });
  }

  disconnect() {
    if (this.sshProcess) {
      this.sshProcess.stdin.write('exit\n');
      this.sshProcess = null;
      this.connected = false;
    }
  }
}

export default SSHClient;