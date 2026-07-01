import { describe, expect, it } from 'vitest';
import { resumenImport } from './cadetes';

describe('resumenImport', () => {
  it('resume inserciones y errores', () => {
    expect(resumenImport({ insertados: 3, errores: [] })).toBe('3 insertado(s), 0 con error');
    expect(resumenImport({ insertados: 1, errores: [{ indice: 0, matricula: 'X', motivo: 'dup' }] })).toBe('1 insertado(s), 1 con error');
  });
});
