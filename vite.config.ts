import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El backend NestJS corre en :3000 con prefijo /api. En dev se hace proxy para
// evitar CORS; en prod se sirve tras el mismo origen o vía VITE_API_URL.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SGA-Militar',
        short_name: 'SGA',
        description: 'Sistema de Gestión Académica Multi-Plantel',
        lang: 'es-MX',
        theme_color: '#1f2d3d',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
