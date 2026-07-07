import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';

/** Envuelve un componente con los providers de la app para pruebas. */
export function renderConProviders(ui: ReactNode, { route = '/' }: { route?: string } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const resultado = render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );
  return { ...resultado, queryClient };
}

/** Construye un JWT de prueba (sin firma real) con el payload dado. */
export function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma`;
}
