import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({ api: { post: vi.fn() } }));

import { api } from './client';
import { encolar, pendientes, sincronizar } from './offlineQueue';

const post = vi.mocked(api.post);

const captura = (matricula: string) => ({
  cursoId: 'c1',
  fecha: '2026-07-01',
  registros: [{ cadeteMatricula: matricula, codigo: 'A' }],
});

beforeEach(() => {
  localStorage.clear();
  post.mockReset();
});

describe('cola offline de asistencia', () => {
  it('encola y cuenta pendientes', () => {
    expect(pendientes()).toBe(0);
    encolar(captura('m1'));
    encolar(captura('m2'));
    expect(pendientes()).toBe(2);
  });

  it('sincroniza y vacía la cola cuando el POST tiene éxito', async () => {
    encolar(captura('m1'));
    encolar(captura('m2'));
    post.mockResolvedValue({ data: {} });
    const sincronizadas = await sincronizar();
    expect(sincronizadas).toBe(2);
    expect(post).toHaveBeenCalledTimes(2);
    expect(pendientes()).toBe(0);
  });

  it('conserva en la cola las capturas que fallan', async () => {
    encolar(captura('ok'));
    encolar(captura('falla'));
    post.mockResolvedValueOnce({ data: {} }).mockRejectedValueOnce(new Error('sin red'));
    const sincronizadas = await sincronizar();
    expect(sincronizadas).toBe(1);
    expect(pendientes()).toBe(1);
  });
});
