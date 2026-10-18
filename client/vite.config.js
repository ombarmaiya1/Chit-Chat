import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/auth': {
        target: 'http://localhost:4500',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:4500',
        changeOrigin: true,
        secure: false,
      },
      '/messages': {
    target: 'http://localhost:4500',
    changeOrigin: true,
    secure: false,
  },
    },
  },
});
