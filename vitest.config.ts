import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Config de pruebas separada de vite.config (sin el plugin PWA).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
