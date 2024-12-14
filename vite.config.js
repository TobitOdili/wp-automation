import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.xml'], // Include XML files as assets
  build: {
    rollupOptions: {
      external: ['fs/promises']
    }
  },
  optimizeDeps: {
    exclude: ['fs/promises']
  }
});