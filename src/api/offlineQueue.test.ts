import { beforeEach, describe, expect, it, vi } from 'vitest';

const tokenActual = { valor: 'token-de-prueba' as string | null };

vi.mock('./client', () => ({
  api: { post: vi.fn() },
  tokenStore: { get: () => tokenActual.valor, set: vi.fn(), clear: vi.fn() },
}));

import { api } from './client';
import { encolar, limpiarRechazadas, pendientes, rechazadas, sincronizar } from './offlineQueue';

const post = vi.mocked(api.post);

const captura = (matricula: string) => ({
  cursoId: 'c1',
  fecha: '2026-07-01',
  registros: [{ cadeteMatricula: matricula, codigo: 'A' }],
});

const error4xx = (status: number, message: string) => ({ response: { status, data: { message } } });

beforeEach(() => {
  localStorage.clear();
  post.mockReset();
  tokenActual.valor = 'token-de-prueba';
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

  it('conserva en la cola las capturas con error de red (sin respuesta del servidor)', async () => {
    encolar(captura('ok'));
    encolar(captura('falla'));
    post.mockResolvedValueOnce({ data: {} }).mockRejectedValueOnce(new Error('sin red'));
    const sincronizadas = await sincronizar();
    expect(sincronizadas).toBe(1);
    expect(pendientes()).toBe(1);
    expect(rechazadas()).toHaveLength(0);
  });

  it('descarta a rechazadas (con motivo del servidor) las capturas con 4xx, sin reencolarlas', async () => {
    encolar(captura('invalida'));
    post.mockRejectedValueOnce(error4xx(400, 'Código de asistencia inválido'));
    const sincronizadas = await sincronizar();
    expect(sincronizadas).toBe(0);
    expect(pendientes()).toBe(0);
    const lista = rechazadas();
    expect(lista).toHaveLength(1);
    expect(lista[0].motivo).toBe('Código de asistencia inválido');
    limpiarRechazadas();
    expect(rechazadas()).toHaveLength(0);
  });

  it('reintenta (no descarta) ante un 5xx del servidor', async () => {
    encolar(captura('m1'));
    post.mockRejectedValueOnce({ response: { status: 503, data: {} } });
    expect(await sincronizar()).toBe(0);
    expect(pendientes()).toBe(1);
    expect(rechazadas()).toHaveLength(0);
  });

  it('no sincroniza sin token de sesión', async () => {
    encolar(captura('m1'));
    tokenActual.valor = null;
    expect(await sincronizar()).toBe(0);
    expect(post).not.toHaveBeenCalled();
    expect(pendientes()).toBe(1);
  });
});
