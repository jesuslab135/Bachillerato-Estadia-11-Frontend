import { describe, expect, it } from 'vitest';
import { accionesWorkflow, criterios15, pesosValidos } from './parciales';

describe('accionesWorkflow (RF-WF)', () => {
  it('Borrador/Reabierto → cerrar (cualquier rol capturador)', () => {
    expect(accionesWorkflow('Borrador', 'Docente')).toEqual(['cerrar']);
    expect(accionesWorkflow('Reabierto', 'Coordinador')).toEqual(['cerrar']);
  });

  it('CerradoDocente → validar/devolver solo Coordinación', () => {
    expect(accionesWorkflow('CerradoDocente', 'Coordinador')).toEqual(['validar', 'devolver']);
    expect(accionesWorkflow('CerradoDocente', 'Docente')).toEqual([]);
  });

  it('Validado → reabrir solo Coordinación', () => {
    expect(accionesWorkflow('Validado', 'Coordinador')).toEqual(['reabrir']);
    expect(accionesWorkflow('Validado', 'Docente')).toEqual([]);
  });
});

describe('pesosValidos (RN-02 en cliente)', () => {
  it('acepta suma 1.0 con EX en rango', () => {
    expect(pesosValidos({ ti: 0.2, te: 0.2, ta: 0.2, ex: 0.4 })).toBe(true);
    expect(pesosValidos({ ti: 0.1, te: 0.1, ta: 0.1, ex: 0.7 })).toBe(true);
  });

  it('rechaza suma ≠ 1.0 o EX fuera de [0.20,0.70]', () => {
    expect(pesosValidos({ ti: 0.3, te: 0.3, ta: 0.3, ex: 0.3 })).toBe(false); // suma 1.2
    expect(pesosValidos({ ti: 0.09, te: 0.1, ta: 0.1, ex: 0.71 })).toBe(false); // EX > 0.70
    expect(pesosValidos({ ti: 0.27, te: 0.27, ta: 0.27, ex: 0.19 })).toBe(false); // EX < 0.20
  });
});

describe('criterios15', () => {
  it('genera 15 criterios (5 por tipo) que suman el peso macro', () => {
    const cs = criterios15({ ti: 0.2, te: 0.2, ta: 0.2, ex: 0.4 });
    expect(cs).toHaveLength(15);
    const sumaTI = cs.filter((c) => c.tipo === 'TI').reduce((a, c) => a + c.peso, 0);
    expect(sumaTI).toBeCloseTo(0.2);
  });
});
