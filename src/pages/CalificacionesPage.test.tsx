import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  tokenStore: { get: () => null, set: () => {}, clear: () => {} },
}));

import { api } from '../api/client';
import { CalificacionesPage } from './CalificacionesPage';
import { renderConProviders } from '../test/render';

const get = vi.mocked(api.get);

const matriz = () => ({
  actividades: [{ id: 'act1', tipo: 'TI', orden: 1, nombre: 'Mapa mental' }],
  cadetes: [{ matricula: 'A1', nombreCompleto: 'Ana Activa', estatus: 'Activo' }],
  calificaciones: { A1: { act1: null } },
  examenes: {},
});

const parciales = (estado: string) => [{ numero: 1, estado, pesoTI: 0.2, pesoTE: 0.2, pesoTA: 0.2, pesoEX: 0.4 }];

function mockGets(estadoParcial: string) {
  get.mockImplementation((url: string) => {
    if (url.includes('/calificaciones')) return Promise.resolve({ data: matriz() });
    if (url.includes('/parciales') && !url.includes('/calculo')) return Promise.resolve({ data: parciales(estadoParcial) });
    if (url.includes('/calculo')) return Promise.resolve({ data: { cadetes: [] } });
    return Promise.resolve({ data: [] });
  });
}

function render() {
  return renderConProviders(
    <Routes>
      <Route path="/cursos/:cursoId/calificaciones" element={<CalificacionesPage />} />
    </Routes>,
    { route: '/cursos/C1/calificaciones' },
  );
}

beforeEach(() => {
  get.mockReset();
});

describe('CalificacionesPage — captura estable (FB-F-13)', () => {
  it('no borra lo tecleado cuando la matriz refetchea con nueva identidad', async () => {
    mockGets('Borrador');
    const user = userEvent.setup();
    const { queryClient } = render();
    const input = await screen.findByLabelText('Calificación Ana Activa');
    await user.type(input, '8.5');
    expect(input).toHaveValue('8.5');
    // Refetch: el mock devuelve un objeto nuevo (misma forma, identidad distinta).
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['matriz'] });
    });
    expect(screen.getByLabelText('Calificación Ana Activa')).toHaveValue('8.5');
  });
});

describe('CalificacionesPage — parcial no editable (FB-F-15, RN-06)', () => {
  it('bloquea la captura y explica cuando el parcial está Validado', async () => {
    mockGets('Validado');
    render();
    expect(await screen.findByText(/Captura bloqueada/)).toBeInTheDocument();
    expect(await screen.findByLabelText('Calificación Ana Activa')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar calificaciones' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar examen' })).toBeDisabled();
  });

  it('permite capturar cuando el parcial es editable', async () => {
    mockGets('Borrador');
    render();
    expect(await screen.findByLabelText('Calificación Ana Activa')).toBeEnabled();
    expect(screen.queryByText(/Captura bloqueada/)).not.toBeInTheDocument();
  });
});
