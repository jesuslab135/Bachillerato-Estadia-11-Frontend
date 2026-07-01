import { describe, expect, it } from 'vitest';
import { decodificarSesion } from './jwt';
import { fakeJwt } from '../test/render';

describe('decodificarSesion', () => {
  it('extrae rol, plantel y bandera de cambio del payload', () => {
    const token = fakeJwt({ sub: 'u1', email: 'a@sga.local', rol: 'Coordinador', plantelId: 'p1', debeCambiar: true });
    expect(decodificarSesion(token)).toEqual({
      sub: 'u1',
      email: 'a@sga.local',
      rol: 'Coordinador',
      plantelId: 'p1',
      debeCambiar: true,
    });
  });

  it('devuelve null si falta sub o rol', () => {
    expect(decodificarSesion(fakeJwt({ email: 'x' }))).toBeNull();
  });

  it('devuelve null ante un token corrupto', () => {
    expect(decodificarSesion('no-es-un-jwt')).toBeNull();
  });
});
