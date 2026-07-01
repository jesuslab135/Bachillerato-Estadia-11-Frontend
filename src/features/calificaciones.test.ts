import { describe, expect, it } from 'vitest';
import { examenInicial } from './calificaciones';

describe('examenInicial', () => {
  it('sin examen ⇒ vacío, sin NP', () => {
    expect(examenInicial(undefined)).toEqual({ valor: '', np: false });
  });

  it('NP ⇒ marca np y valor vacío', () => {
    expect(examenInicial({ valor: null, estatus: 'NP' })).toEqual({ valor: '', np: true });
  });

  it('presentado ⇒ valor numérico, sin NP', () => {
    expect(examenInicial({ valor: 8, estatus: 'PRESENTADO' })).toEqual({ valor: 8, np: false });
  });
});
