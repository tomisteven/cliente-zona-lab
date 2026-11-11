import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 8080,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.DEV_API_TARGET || 'http://localhost:5050',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.DEV_API_TARGET || 'http://localhost:5050',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 8080,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      clearMocks: true,
      restoreMocks: true,
      css: false,
    },
  };
});
