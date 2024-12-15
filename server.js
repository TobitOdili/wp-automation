import express from 'express';
import { createServer } from 'http';
import { SSHProxyServer } from './src/services/ssh/SSHProxyServer.js';

const app = express();
const server = createServer(app);

// Create SSH proxy server
const sshProxy = new SSHProxyServer(server);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.info(`[SSH] Proxy server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.info('[SSH] Shutting down...');
  sshProxy.cleanupAll();
  server.close();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[SSH] Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[SSH] Unhandled rejection:', error);
});