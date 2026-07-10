import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../api/client', () => ({
  api: { post: vi.fn(), get: vi.fn() },
  tokenStore: {
    get: () => localStorage.getItem('sga_token'),
    set: (t: string) => localStorage.setItem('sga_token', t),
    clear: () => localStorage.removeItem('sga_token'),
  },
}));

import { api } from '../api/client';
import { LoginPage } from './LoginPage';
import { fakeJwt, renderConProviders } from '../test/render';

const post = vi.mocked(api.post);

beforeEach(() => {
  localStorage.clear();
  post.mockReset();
});

describe('LoginPage (RF-AUTH-01)', () => {
  it('envía las credenciales al backend', async () => {
    post.mockResolvedValue({
      data: { accessToken: fakeJwt({ sub: 'u1', rol: 'Docente', plantelId: 'p1', debeCambiar: false }), debeCambiarContrasena: false },
    });
    renderConProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Correo institucional'), 'doc@sga.local');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/auth/login', { email: 'doc@sga.local', password: 'secreto123' }));
  });

  it('valida el correo y no llama al backend si es inválido', async () => {
    renderConProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('Correo institucional'), 'no-es-correo');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Correo inválido')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('muestra el error cuando el backend rechaza las credenciales', async () => {
    post.mockRejectedValue({ response: { data: { message: 'Credenciales inválidas' } }, isAxiosError: true });
    renderConProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText('Correo institucional'), 'doc@sga.local');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'malo');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
