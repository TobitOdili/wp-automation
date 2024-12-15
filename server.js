import express from 'express';
import { createServer } from 'http';
import { SSHProxyServer } from './src/services/ssh/SSHProxyServer.js';

const app = express();
const server = createServer(app);

// Initialize SSH proxy server
new SSHProxyServer(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SSH proxy server running on port ${PORT}`);
});