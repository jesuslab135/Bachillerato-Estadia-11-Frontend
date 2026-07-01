import { describe, expect, it } from 'vitest';
import { cursoCompleto } from './catalogos';

describe('cursoCompleto', () => {
  it('requiere materia, grupo, docente y periodo', () => {
    expect(cursoCompleto({ materiaId: 'm', grupoId: 'g', docenteId: 'd', periodoId: 'p' })).toBe(true);
  });

  it('falta cualquiera ⇒ incompleto', () => {
    expect(cursoCompleto({ materiaId: 'm', grupoId: 'g', docenteId: 'd', periodoId: null })).toBe(false);
    expect(cursoCompleto({ materiaId: null, grupoId: 'g', docenteId: 'd', periodoId: 'p' })).toBe(false);
  });
});
