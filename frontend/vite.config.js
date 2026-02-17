import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5018',
        changeOrigin: true,
        // Removemos o rewrite complexo para evitar o /api/api
        secure: false
      }
    }
  }
});