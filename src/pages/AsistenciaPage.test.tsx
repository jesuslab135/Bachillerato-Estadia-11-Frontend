import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  tokenStore: { get: () => null, set: () => {}, clear: () => {} },
}));

import { api } from '../api/client';
import { AsistenciaPage } from './AsistenciaPage';
import { renderConProviders } from '../test/render';

const get = vi.mocked(api.get);

const cursos = [{ id: 'C1', materia: { clave: 'MAT-1', nombre: 'Matemáticas' }, grupo: { id: 'G1', nombre: '1A' } }];
const roster = [
  { matricula: 'A1', nombreCompleto: 'Ana Activa', estatus: 'Activo' },
  { matricula: 'Z9', nombreCompleto: 'Beto Baja', estatus: 'BajaDefinitiva' },
];
const resumen = {
  parcial: 1,
  cadetes: [
    {
      matricula: 'A1',
      nombreCompleto: 'Ana Activa',
      estatus: 'Activo',
      total: 6,
      asistencias: 3,
      retardos: 0,
      faltas: 3,
      justificadas: 0,
      porcentajeAsistencia: 0.5,
      tieneDerechoExamen: false,
      sde: true,
    },
  ],
};

beforeEach(() => {
  get.mockReset();
  get.mockImplementation((url: string) => {
    if (url === '/api/cursos') return Promise.resolve({ data: cursos });
    if (url.startsWith('/api/cadetes')) return Promise.resolve({ data: roster });
    if (url.includes('/asistencia')) return Promise.resolve({ data: [] });
    if (url.includes('/resumen')) return Promise.resolve({ data: resumen });
    return Promise.resolve({ data: [] });
  });
});

function render() {
  return renderConProviders(
    <Routes>
      <Route path="/cursos/:cursoId/asistencia" element={<AsistenciaPage />} />
    </Routes>,
    { route: '/cursos/C1/asistencia' },
  );
}

describe('AsistenciaPage', () => {
  it('muestra el roster con la alerta SDE (RN-01)', async () => {
    render();
    expect(await screen.findByText('Ana Activa')).toBeInTheDocument();
    expect(await screen.findByText('SDE')).toBeInTheDocument();
  });

  it('resalta y bloquea a un cadete en baja definitiva (RN-05)', async () => {
    const { container } = render();
    expect(await screen.findByText('Baja definitiva')).toBeInTheDocument();
    // El SegmentedControl del cadete en baja queda deshabilitado (radios disabled).
    expect(container.querySelectorAll('input:disabled').length).toBeGreaterThan(0);
  });
});
