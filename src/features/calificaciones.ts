import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export type TipoCategoria = 'TI' | 'TE' | 'TA';

export interface Actividad {
  id: string;
  tipo: TipoCategoria;
  orden: number;
  nombre: string;
}

export interface CadeteMatriz {
  matricula: string;
  nombreCompleto: string;
  estatus: string;
}

export interface ExamenEntry {
  valor: number | null;
  estatus: string;
}

export interface Matriz {
  actividades: Actividad[];
  cadetes: CadeteMatriz[];
  calificaciones: Record<string, Record<string, number | null>>;
  examenes: Record<string, ExamenEntry | undefined>;
}

export interface FilaCalculo {
  matricula: string;
  nombreCompleto: string;
  promTI: number;
  promTE: number;
  promTA: number;
  evaluacionContinua: number;
  examen: number | 'NP' | null;
  sde: boolean;
  califCruda: number;
  puntoExtra: boolean;
  califFinal: number;
}

/** Estado inicial de la celda de examen a partir del valor guardado (NP ⇒ marca np). */
export function examenInicial(entry: ExamenEntry | undefined): { valor: number | ''; np: boolean } {
  if (!entry) return { valor: '', np: false };
  if (entry.estatus === 'NP') return { valor: '', np: true };
  return { valor: entry.valor ?? '', np: false };
}

export function useMatriz(cursoId: string, numero: number) {
  return useQuery({
    queryKey: ['matriz', cursoId, numero],
    queryFn: async () => (await api.get<Matriz>(`/api/cursos/${cursoId}/parciales/${numero}/calificaciones`)).data,
  });
}

export function useCalculo(cursoId: string, numero: number) {
  return useQuery({
    queryKey: ['calculo', cursoId, numero],
    queryFn: async () => (await api.get<{ cadetes: FilaCalculo[] }>(`/api/cursos/${cursoId}/parciales/${numero}/calculo`)).data,
  });
}

export function useCrearActividad(cursoId: string, numero: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { tipo: TipoCategoria; nombre: string }) =>
      (await api.post(`/api/cursos/${cursoId}/parciales/${numero}/actividades`, vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matriz', cursoId, numero] }),
  });
}

function invalidarCalculo(qc: ReturnType<typeof useQueryClient>, cursoId: string, numero: number) {
  qc.invalidateQueries({ queryKey: ['matriz', cursoId, numero] });
  qc.invalidateQueries({ queryKey: ['calculo', cursoId, numero] });
}

export function useCapturarCalificaciones(cursoId: string, numero: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { actividadId: string; registros: { cadeteMatricula: string; valor: number }[] }) =>
      (await api.post(`/api/cursos/${cursoId}/actividades/${vars.actividadId}/calificaciones`, { registros: vars.registros })).data,
    onSuccess: () => invalidarCalculo(qc, cursoId, numero),
  });
}

export function useCapturarExamen(cursoId: string, numero: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (registros: { cadeteMatricula: string; valor?: number; np?: boolean }[]) =>
      (await api.post(`/api/cursos/${cursoId}/parciales/${numero}/examen`, { registros })).data,
    onSuccess: () => invalidarCalculo(qc, cursoId, numero),
  });
}
