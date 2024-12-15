import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';

const app = express();
const server = createServer(app);

// Create WebSocket server with explicit path
const wss = new WebSocketServer({ 
  server,
  path: '/ssh-proxy'
});

// Track active connections
const connections = new Map();

// Connection handler
wss.on('connection', (ws) => {
  console.info('[SSH] New WebSocket connection');
  
  const sshClient = new Client();
  const id = Math.random().toString(36).slice(2);
  connections.set(id, { ws, sshClient });

  // Setup ping/pong
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // Message handler
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.debug('[SSH] Received message:', message.type);
      
      const conn = connections.get(id);
      if (!conn) {
        console.error('[SSH] Connection not found for ID:', id);
        ws.send(JSON.stringify({ 
          id: message.id,
          type: 'error',
          error: 'Connection not found'
        }));
        return;
      }

      switch (message.type) {
        case 'auth':
          handleAuth(conn, message);
          break;
        case 'command':
          handleCommand(conn, message);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          console.warn('[SSH] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[SSH] Message handling error:', error);
      ws.send(JSON.stringify({
        id: message?.id,
        type: 'error',
        error: error.message
      }));
    }
  });

  // Close handler
  ws.on('close', () => {
    console.info('[SSH] Client disconnected');
    const conn = connections.get(id);
    if (conn?.sshClient) {
      conn.sshClient.end();
    }
    connections.delete(id);
  });

  // Error handler
  ws.on('error', (error) => {
    console.error('[SSH] WebSocket error:', error);
  });
});

// Heartbeat check
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.warn('[SSH] Client heartbeat timeout');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 15000); // Check every 15 seconds

wss.on('close', () => {
  clearInterval(interval);
});

function handleAuth({ ws, sshClient }, message) {
  const { credentials } = message;
  console.info('[SSH] Attempting connection to:', credentials.host);

  sshClient.on('ready', () => {
    console.info('[SSH] Connection established');
    ws.send(JSON.stringify({
      id: message.id,
      type: 'auth_success'
    }));
  });

  sshClient.on('error', (error) => {
    console.error('[SSH] Connection error:', error.message);
    ws.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: error.message
    }));
  });

  try {
    sshClient.connect({
      host: credentials.host,
      port: 22,
      username: credentials.username,
      password: credentials.password,
      readyTimeout: 60000,
      keepaliveInterval: 10000,
      debug: (msg) => console.debug('[SSH Debug]', msg)
    });
  } catch (error) {
    console.error('[SSH] Connect error:', error);
    ws.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: error.message
    }));
  }
}

function handleCommand({ ws, sshClient }, message) {
  if (!sshClient._sock) {
    console.error('[SSH] No active connection for command');
    ws.send(JSON.stringify({
      id: message.id,
      type: 'error',
      error: 'SSH connection not established'
    }));
    return;
  }

  console.debug('[SSH] Executing command:', message.command);

  sshClient.exec(message.command, (err, stream) => {
    if (err) {
      console.error('[SSH] Command execution error:', err);
      ws.send(JSON.stringify({
        id: message.id,
        type: 'error',
        error: err.message
      }));
      return;
    }

    let output = '';
    let error = '';

    stream.on('data', (data) => {
      output += data;
      ws.send(JSON.stringify({
        id: message.id,
        type: 'output',
        data: data.toString()
      }));
    });

    stream.stderr.on('data', (data) => {
      error += data;
      ws.send(JSON.stringify({
        id: message.id,
        type: 'error',
        data: data.toString()
      }));
    });

    stream.on('close', (code) => {
      console.debug('[SSH] Command completed with code:', code);
      ws.send(JSON.stringify({
        id: message.id,
        type: 'exit',
        code,
        output,
        error
      }));
    });
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.info(`[SSH] Proxy server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.info('[SSH] Shutting down...');
  connections.forEach(({ sshClient }) => sshClient.end());
  server.close();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[SSH] Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[SSH] Unhandled rejection:', error);
});