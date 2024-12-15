import { WebSocketServer } from 'ws';
import { Client as SSHClient } from 'ssh2';

export class SSHProxyServer {
  constructor(server) {
    this.wss = new WebSocketServer({ 
      server,
      perMessageDeflate: false // Disable compression for better performance
    });
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      const sshClient = new SSHClient();
      let authenticated = false;

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          
          switch (message.type) {
            case 'auth':
              await this.handleAuth(ws, sshClient, message);
              authenticated = true;
              break;
              
            case 'command':
              if (!authenticated) {
                this.sendError(ws, message.id, 'Not authenticated');
                return;
              }
              await this.handleCommand(ws, sshClient, message);
              break;
              
            case 'ping':
              ws.send('pong');
              break;
              
            default:
              this.sendError(ws, message.id, 'Unknown message type');
          }
        } catch (error) {
          console.error('SSH proxy error:', error);
          this.sendError(ws, message?.id, error.message);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        sshClient.end();
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        sshClient.end();
      });
    });
  }

  async handleAuth(ws, sshClient, message) {
    const { credentials } = message;
    
    return new Promise((resolve, reject) => {
      let authTimeout = setTimeout(() => {
        sshClient.end();
        reject(new Error('Authentication timeout'));
      }, 30000);

      sshClient.on('ready', () => {
        clearTimeout(authTimeout);
        this.sendMessage(ws, {
          id: message.id,
          type: 'auth_success'
        });
        resolve();
      });

      sshClient.on('error', (error) => {
        clearTimeout(authTimeout);
        this.sendError(ws, message.id, `SSH connection failed: ${error.message}`);
        reject(error);
      });

      // Support keyboard-interactive auth
      sshClient.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish([credentials.password]);
        } else {
          finish([]);
        }
      });

      sshClient.connect({
        host: credentials.host,
        port: 22,
        username: credentials.username,
        password: credentials.password,
        tryKeyboard: true,
        readyTimeout: 30000,
        keepaliveInterval: 10000
      });
    });
  }

  async handleCommand(ws, sshClient, message) {
    sshClient.exec(message.command, (err, stream) => {
      if (err) {
        this.sendError(ws, message.id, err.message);
        return;
      }

      let output = '';
      let error = '';

      stream.on('data', (data) => {
        output += data;
        this.sendMessage(ws, {
          id: message.id,
          type: 'output',
          data: data.toString()
        });
      });

      stream.stderr.on('data', (data) => {
        error += data;
        this.sendMessage(ws, {
          id: message.id,
          type: 'error',
          data: data.toString()
        });
      });

      stream.on('close', (code) => {
        this.sendMessage(ws, {
          id: message.id,
          type: 'exit',
          code,
          output,
          error
        });
      });

      // Handle stream errors
      stream.on('error', (err) => {
        this.sendError(ws, message.id, `Stream error: ${err.message}`);
      });
    });
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, id, error) {
    this.sendMessage(ws, {
      id,
      type: 'error',
      error
    });
  }
}