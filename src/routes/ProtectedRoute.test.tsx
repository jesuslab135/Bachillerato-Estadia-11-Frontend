import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

const sesionActual = { token: null as string | null };

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  tokenStore: { get: () => sesionActual.token, set: vi.fn(), clear: vi.fn() },
}));

import { ProtectedRoute } from './ProtectedRoute';
import { renderConProviders, fakeJwt } from '../test/render';

const token = (payload: Record<string, unknown>) =>
  fakeJwt({ email: 'u@sga.local', plantelId: 'p1', debeCambiar: false, ...payload });

function renderRutas(route: string) {
  return renderConProviders(
    <Routes>
      <Route path="/login" element={<div>PANTALLA LOGIN</div>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<div>PANTALLA INICIO</div>} />
        <Route path="/cambiar-contrasena" element={<div>PANTALLA CAMBIAR</div>} />
        <Route element={<ProtectedRoute roles={['Coordinador', 'Operador']} />}>
          <Route path="/cadetes" element={<div>PANTALLA CADETES</div>} />
        </Route>
      </Route>
    </Routes>,
    { route },
  );
}

beforeEach(() => {
  sesionActual.token = null;
});

describe('ProtectedRoute — matriz de redirección (FB-F-14)', () => {
  it('sin sesión redirige a /login', () => {
    renderRutas('/');
    expect(screen.getByText('PANTALLA LOGIN')).toBeInTheDocument();
  });

  it('con debeCambiar fuerza /cambiar-contrasena', () => {
    sesionActual.token = token({ sub: 'u1', rol: 'Docente', debeCambiar: true });
    renderRutas('/');
    expect(screen.getByText('PANTALLA CAMBIAR')).toBeInTheDocument();
  });

  it('un Docente no entra a una ruta de Coordinación: vuelve a Inicio', () => {
    sesionActual.token = token({ sub: 'u1', rol: 'Docente' });
    renderRutas('/cadetes');
    expect(screen.getByText('PANTALLA INICIO')).toBeInTheDocument();
  });

  it('un Coordinador sí entra a la ruta restringida', () => {
    sesionActual.token = token({ sub: 'u2', rol: 'Coordinador' });
    renderRutas('/cadetes');
    expect(screen.getByText('PANTALLA CADETES')).toBeInTheDocument();
  });

  it('una sesión expirada equivale a no tener sesión', () => {
    sesionActual.token = token({ sub: 'u1', rol: 'Docente', exp: Math.floor(Date.now() / 1000) - 60 });
    renderRutas('/');
    expect(screen.getByText('PANTALLA LOGIN')).toBeInTheDocument();
  });
});
