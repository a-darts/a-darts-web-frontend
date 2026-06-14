import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config'; // 👈 Importante importar los defaults

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    define: {
      'process.env.API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3000/api'),
      'process.env.SOCKET_URL': JSON.stringify(env.VITE_SOCKET_URL || 'http://localhost:3000'),
    },

    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [
        ...configDefaults.exclude,
        'tests/e2e/**'
      ],
    }
  };
});
