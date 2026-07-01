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
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Mensaje claro cuando el backend no está arriba: evita ver un 500 opaco en el navegador.
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error(`\n[proxy] No se pudo contactar al backend en http://localhost:3000 (${err.message}). ¿Está corriendo 'npm run start:dev' en backend/?\n`);
          });
        },
      },
    },
  },
});
