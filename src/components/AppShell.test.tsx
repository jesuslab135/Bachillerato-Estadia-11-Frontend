import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
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
    api: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn(), patch: vi.fn() },
    tokenStore: { get: () => token, set: () => {}, clear: () => {} },
  };
});

import { AppShell } from './AppShell';
import { renderConProviders } from '../test/render';

function render() {
  return renderConProviders(
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<div>CONTENIDO</div>} />
      </Route>
    </Routes>,
  );
}

describe('AppShell — navegación móvil (FB-F-16)', () => {
  it('el burger abre el drawer con los links filtrados por rol y salir', async () => {
    const user = userEvent.setup();
    render();
    await user.click(screen.getByLabelText('Abrir menú de navegación'));
    const drawer = await screen.findByRole('dialog');
    for (const etiqueta of ['Inicio', 'Cursos', 'Cadetes', 'Catálogos']) {
      expect(within(drawer).getByRole('link', { name: etiqueta })).toBeInTheDocument();
    }
    expect(within(drawer).getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('el logo es un enlace a Inicio', () => {
    render();
    expect(screen.getByRole('link', { name: 'SGA-Militar' })).toHaveAttribute('href', '/');
  });
});
