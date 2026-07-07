import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  tokenStore: { get: () => null, set: () => {}, clear: () => {} },
}));

import { api } from '../api/client';
import { ActaPage } from './ActaPage';
import { renderConProviders } from '../test/render';

const get = vi.mocked(api.get);

const acta = {
  version: 1,
  generadaEn: '2026-07-01T00:00:00Z',
  firmadaDocenteEn: null,
  firmadaCoordinacionEn: null,
  hashPdf: null,
  cadetes: [
    {
      matricula: 'A1',
      nombreCompleto: 'Ana Activa',
      estatus: 'Activo',
      parciales: [4, 8, 8],
      ordinario: null,
      extraordinario: null,
      tds: null,
      observacion: 'Presenta Ordinario',
      calificacionFinal: 6,
    },
  ],
};

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: acta });
});

function render() {
  return renderConProviders(
    <Routes>
      <Route path="/cursos/:cursoId/acta" element={<ActaPage />} />
    </Routes>,
    { route: '/cursos/C1/acta' },
  );
}

describe('ActaPage — captura de recuperación (FB-F-10)', () => {
  it('deshabilita el botón de recuperación mientras el valor está vacío', async () => {
    render();
    const boton = await screen.findByRole('button', { name: 'Ordinario' });
    expect(boton).toBeDisabled();
  });

  it('habilita el botón al capturar un valor', async () => {
    const user = userEvent.setup();
    render();
    const input = await screen.findByLabelText('Nota Ordinario');
    await user.type(input, '7');
    expect(screen.getByRole('button', { name: 'Ordinario' })).toBeEnabled();
  });
});
