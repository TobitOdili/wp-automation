import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.xml'],
  server: {
    proxy: {
      '/ssh-proxy': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['fs/promises']
    }
  },
  optimizeDeps: {
    exclude: ['fs/promises']
  }
});