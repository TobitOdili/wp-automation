import express from 'express';
import { createServer } from 'http';
import { SSHProxyServer } from './src/services/ssh/SSHProxyServer.js';
import { WebSocket } from 'ws';

const app = express();
const server = createServer(app);

// Initialize SSH proxy server
const sshProxy = new SSHProxyServer(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SSH proxy server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Shutting down SSH proxy server...');
  sshProxy.cleanup();
  server.close();
});