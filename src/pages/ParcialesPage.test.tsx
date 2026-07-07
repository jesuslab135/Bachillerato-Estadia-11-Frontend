import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

vi.mock('../api/client', () => {
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({
    sub: 'u1',
    email: 'coord@sga.local',
    rol: 'Coordinador',
    plantelId: 'p1',
    debeCambiar: false,
  })}.firma`;
  return {
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
    tokenStore: { get: () => token, set: () => {}, clear: () => {} },
  };
});

import { api } from '../api/client';
import { ParcialesPage } from './ParcialesPage';
import { renderConProviders } from '../test/render';

const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

const parciales = [{ numero: 1, estado: 'Validado', pesoTI: 0.2, pesoTE: 0.2, pesoTA: 0.2, pesoEX: 0.4 }];

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  get.mockResolvedValue({ data: parciales });
  post.mockResolvedValue({ data: {} });
});

async function abrirModal() {
  const user = userEvent.setup();
  renderConProviders(
    <Routes>
      <Route path="/cursos/:cursoId/parciales" element={<ParcialesPage />} />
    </Routes>,
    { route: '/cursos/C1/parciales' },
  );
  await user.click(await screen.findByRole('button', { name: 'reabrir' }));
  return user;
}

describe('ParcialesPage — modal de reapertura (FB-F-10, RN-06)', () => {
  it('bloquea el envío con motivo menor a 30 caracteres', async () => {
    const user = await abrirModal();
    const confirmar = await screen.findByRole('button', { name: 'Reabrir parcial' });
    expect(confirmar).toBeDisabled();
    await user.type(screen.getByLabelText('Motivo de reapertura'), 'motivo corto');
    expect(confirmar).toBeDisabled();
    expect(post).not.toHaveBeenCalled();
  });

  it('habilita el envío con 30+ caracteres y manda el motivo', async () => {
    const user = await abrirModal();
    const motivo = 'Se corrige calificación mal capturada del examen parcial.';
    await user.type(await screen.findByLabelText('Motivo de reapertura'), motivo);
    const confirmar = screen.getByRole('button', { name: 'Reabrir parcial' });
    expect(confirmar).toBeEnabled();
    await user.click(confirmar);
    expect(post).toHaveBeenCalledWith('/api/cursos/C1/parciales/1/reabrir', { motivo });
  });
});
