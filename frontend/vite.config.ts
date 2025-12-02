import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/presentation/components'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),
      '@layouts': path.resolve(__dirname, './src/presentation/layouts'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@services': path.resolve(__dirname, './src/application/services'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
