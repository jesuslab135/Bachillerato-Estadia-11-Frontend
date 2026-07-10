import { describe, expect, it } from 'vitest';
import { fuerzaContrasena } from './CambiarContrasenaPage';

describe('fuerzaContrasena (medidor de fuerza, 2g)', () => {
  it('vacío: nivel 0 sin etiqueta', () => {
    expect(fuerzaContrasena('')).toEqual({ nivel: 0, etiqueta: '' });
  });

  it('corta y simple: débil', () => {
    expect(fuerzaContrasena('abc')).toEqual({ nivel: 0, etiqueta: 'Débil' });
  });

  it('8+ con dígito: aceptable', () => {
    // longitud>=8 (1) + dígito (1) = 2
    expect(fuerzaContrasena('cadete01')).toEqual({ nivel: 2, etiqueta: 'Aceptable' });
  });

  it('8+ con dígito y mayúscula/minúscula: fuerte (tope 3)', () => {
    expect(fuerzaContrasena('Cadete2026')).toEqual({ nivel: 3, etiqueta: 'Fuerte' });
  });

  it('8+ con símbolo cuenta como variedad', () => {
    expect(fuerzaContrasena('cadete!!')).toEqual({ nivel: 2, etiqueta: 'Aceptable' });
  });
});
