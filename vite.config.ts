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
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'SGA-Militar',
        short_name: 'SGA',
        description: 'Sistema de Gestión Académica Multi-Plantel',
        lang: 'es-MX',
        theme_color: '#0b1e40',
        background_color: '#0b1e40',
        display: 'standalone',
        start_url: '/',
        // Iconos placeholder de marca (FB-F-12); sustituir por el logo real del plantel.
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // FB-F-12 (RF-ASIS-06): los GET de /api sobreviven una recarga offline. NetworkFirst con
        // timeout corto para no servir datos viejos con red. El cache no distingue el header
        // Authorization ⇒ dispositivo personal asumido; al cerrar sesión se limpian los caches.
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'sga-api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
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
