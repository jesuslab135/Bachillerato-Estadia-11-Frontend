import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { encolar } from '../api/offlineQueue';

export type Codigo = 'A' | 'F' | 'R' | 'J';
export const CODIGOS: Codigo[] = ['A', 'F', 'R', 'J'];
export const ETIQUETA_CODIGO: Record<Codigo, string> = {
  A: 'Asistencia',
  F: 'Falta',
  R: 'Retardo',
  J: 'Justificada',
};

export interface Curso {
  id: string;
  materia: { clave: string; nombre: string };
  grupo: { id: string; nombre: string };
}

export interface Cadete {
  matricula: string;
  nombreCompleto: string;
  estatus: string;
}

export interface RegistroAsistencia {
  cadeteMatricula: string;
  codigo: Codigo;
}

export interface FilaResumen {
  matricula: string;
  nombreCompleto: string;
  estatus: string;
  total: number;
  asistencias: number;
  retardos: number;
  faltas: number;
  justificadas: number;
  porcentajeAsistencia: number;
  tieneDerechoExamen: boolean;
  sde: boolean;
}

export function useCursos() {
  return useQuery({ queryKey: ['cursos'], queryFn: async () => (await api.get<Curso[]>('/api/cursos')).data });
}

export function useRoster(grupoId: string | undefined) {
  return useQuery({
    queryKey: ['cadetes', grupoId],
    enabled: !!grupoId,
    queryFn: async () => (await api.get<Cadete[]>(`/api/cadetes?grupoId=${grupoId}`)).data,
  });
}

export function useAsistenciaFecha(cursoId: string, fecha: string) {
  return useQuery({
    queryKey: ['asistencia', cursoId, fecha],
    enabled: !!fecha,
    queryFn: async () => (await api.get<RegistroAsistencia[]>(`/api/cursos/${cursoId}/asistencia?fecha=${fecha}`)).data,
  });
}

export function useResumen(cursoId: string, numero: number) {
  return useQuery({
    queryKey: ['resumen', cursoId, numero],
    queryFn: async () => (await api.get<{ parcial: number; cadetes: FilaResumen[] }>(`/api/cursos/${cursoId}/parciales/${numero}/resumen`)).data,
  });
}

export function useCapturarAsistencia(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { fecha: string; registros: RegistroAsistencia[] }): Promise<{ offline: boolean }> => {
      if (!navigator.onLine) {
        encolar({ cursoId, ...vars });
        return { offline: true };
      }
      try {
        await api.post(`/api/cursos/${cursoId}/asistencia`, vars);
        return { offline: false };
      } catch (e) {
        // Error de red (sin respuesta del servidor) ⇒ se encola para sincronizar luego.
        if (e instanceof AxiosError && !e.response) {
          encolar({ cursoId, ...vars });
          return { offline: true };
        }
        throw e;
      }
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['asistencia', cursoId, vars.fecha] });
      qc.invalidateQueries({ queryKey: ['resumen', cursoId] });
    },
  });
}
