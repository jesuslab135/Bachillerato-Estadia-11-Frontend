import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Rol } from '../auth/jwt';

export type EstadoParcial = 'Borrador' | 'CerradoDocente' | 'Validado' | 'Reabierto';
export type AccionWorkflow = 'cerrar' | 'validar' | 'devolver' | 'reabrir';

export interface Parcial {
  numero: number;
  estado: EstadoParcial;
  pesoTI: number;
  pesoTE: number;
  pesoTA: number;
  pesoEX: number;
}

export interface Pesos {
  ti: number;
  te: number;
  ta: number;
  ex: number;
}

const TOLERANCIA = 1e-9;
const ESTADOS_EDITABLES: EstadoParcial[] = ['Borrador', 'Reabierto'];

/** Acciones de la máquina de estados disponibles según estado del parcial y rol (RF-WF). */
export function accionesWorkflow(estado: EstadoParcial, rol: Rol): AccionWorkflow[] {
  const esCoord = rol === 'Coordinador' || rol === 'Operador';
  if (estado === 'Borrador' || estado === 'Reabierto') return ['cerrar'];
  if (estado === 'CerradoDocente') return esCoord ? ['validar', 'devolver'] : [];
  if (estado === 'Validado') return esCoord ? ['reabrir'] : [];
  return [];
}

export function esEditable(estado: EstadoParcial): boolean {
  return ESTADOS_EDITABLES.includes(estado);
}

/** RN-02 en cliente: los 4 pesos suman 1.0 y el examen está en [0.20, 0.70]. */
export function pesosValidos(p: Pesos): boolean {
  const suma = p.ti + p.te + p.ta + p.ex;
  return Math.abs(suma - 1) <= TOLERANCIA && p.ex >= 0.2 && p.ex <= 0.7;
}

/** Distribuye cada peso macro en 5 criterios iguales (macro/5) para el PATCH del backend. */
export function criterios15(p: Pesos) {
  const macro = { TI: p.ti, TE: p.te, TA: p.ta } as const;
  return (['TI', 'TE', 'TA'] as const).flatMap((tipo) =>
    Array.from({ length: 5 }, (_, i) => ({ tipo, orden: i + 1, peso: macro[tipo] / 5 })),
  );
}

export function useParciales(cursoId: string) {
  return useQuery({
    queryKey: ['parciales', cursoId],
    queryFn: async () => (await api.get<Parcial[]>(`/api/cursos/${cursoId}/parciales`)).data,
  });
}

export function useEditarPesos(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { numero: number; pesos: Pesos }) =>
      (await api.patch(`/api/cursos/${cursoId}/parciales/${vars.numero}/pesos`, { ...vars.pesos, criterios: criterios15(vars.pesos) })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parciales', cursoId] }),
  });
}

export function useTransicionParcial(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { numero: number; accion: AccionWorkflow; motivo?: string; comentario?: string }) => {
      const body = vars.accion === 'devolver' ? { comentario: vars.comentario } : vars.accion === 'reabrir' ? { motivo: vars.motivo } : {};
      return (await api.post(`/api/cursos/${cursoId}/parciales/${vars.numero}/${vars.accion}`, body)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parciales', cursoId] });
      qc.invalidateQueries({ queryKey: ['acta', cursoId] });
    },
  });
}
