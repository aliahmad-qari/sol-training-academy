import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    // Warn when a chunk exceeds 1 MB (Vercel limit is generous, but good to know)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      // Local dev only: forward /api requests to the Express backend.
      // In production (Vercel) VITE_API_URL points directly to Render.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
