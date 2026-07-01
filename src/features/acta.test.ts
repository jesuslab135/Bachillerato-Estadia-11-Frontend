import { describe, expect, it } from 'vitest';
import { recuperacionElegible } from './acta';

describe('recuperacionElegible (RN-04)', () => {
  it('mapea cada observación a su instancia de recuperación', () => {
    expect(recuperacionElegible('Presenta Ordinario')).toBe('Ordinario');
    expect(recuperacionElegible('Presenta Extraordinario')).toBe('Extraordinario');
    expect(recuperacionElegible('Habilita TDS')).toBe('TDS');
  });

  it('sin observación (aprobado) no hay recuperación', () => {
    expect(recuperacionElegible('')).toBeNull();
    expect(recuperacionElegible('Otra')).toBeNull();
  });
});
