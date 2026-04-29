import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // Shifer (Grey Mix) — must be before /api to avoid prefix clash
      '/api-shifer': {
        target: 'https://backend-greymix.bis-apps.com',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api-shifer/, ''),
      },
      // JBI (Temir Beton)
      '/api-jbi': {
        target: 'https://backend-greymix-jbi.bis-apps.com',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api-jbi/, ''),
      },
      // Cement (Grey Mix Sement)
      '/api': {
        target: 'https://backend-greymix-sement.bis-apps.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
