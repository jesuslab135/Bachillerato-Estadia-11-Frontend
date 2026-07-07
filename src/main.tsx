import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './global.css';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import { AuthProvider } from './auth/AuthContext';
import { App } from './App';
import { queryClient } from './api/queryClient';
import { sincronizar } from './api/offlineQueue';

// RF-ASIS-06 — al recuperar la conexión, se sincronizan las capturas pendientes.
window.addEventListener('online', () => void sincronizar());
if (navigator.onLine) void sincronizar();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="light" />
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
