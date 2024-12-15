import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { findAvailablePort } from './src/utils/port.js';

// Default ports
const DEFAULT_VITE_PORT = 5173;
const DEFAULT_SERVER_PORT = 3001;

export default defineConfig(async () => {
  // Find available ports for both servers
  const serverPort = await findAvailablePort(DEFAULT_SERVER_PORT);
  const vitePort = await findAvailablePort(DEFAULT_VITE_PORT);

  return {
    plugins: [react()],
    server: {
      port: vitePort,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/ssh-proxy': {
          target: `ws://localhost:${serverPort}`,
          ws: true,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Ensure index.html is copied to dist
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    }
  };
});