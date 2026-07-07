import { describe, expect, it } from 'vitest';
import { hoyLocalISO } from './fechas';

describe('hoyLocalISO (FB-F-9)', () => {
  it('devuelve formato YYYY-MM-DD', () => {
    expect(hoyLocalISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('usa el día de America/Mexico_City, no el corte UTC', () => {
    // 2026-07-07T01:30Z = 2026-07-06 19:30 en México central (UTC-6): sigue siendo día 6 local.
    expect(hoyLocalISO(new Date('2026-07-07T01:30:00Z'))).toBe('2026-07-06');
    // Mediodía UTC = misma fecha en ambas zonas.
    expect(hoyLocalISO(new Date('2026-07-06T12:00:00Z'))).toBe('2026-07-06');
  });
});
