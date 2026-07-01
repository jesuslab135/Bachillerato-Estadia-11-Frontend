import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export interface Materia {
  id: string;
  clave: string;
  nombre: string;
  semestreAplicable: number;
}

export interface Periodo {
  id: string;
  codigo: string;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string;
}

export interface Docente {
  id: string;
  nombreCompleto: string;
  email: string;
}

export interface Plantel {
  id: string;
  clave: string;
  nombre: string;
}

export interface FormCurso {
  materiaId: string | null;
  grupoId: string | null;
  docenteId: string | null;
  periodoId: string | null;
}

/** Un curso puede crearse cuando están elegidos materia, grupo, docente y periodo. */
export function cursoCompleto(f: FormCurso): boolean {
  return !!(f.materiaId && f.grupoId && f.docenteId && f.periodoId);
}

export function usePlanteles() {
  return useQuery({ queryKey: ['planteles'], queryFn: async () => (await api.get<Plantel[]>('/api/planteles')).data });
}

export function useMaterias() {
  return useQuery({ queryKey: ['materias'], queryFn: async () => (await api.get<Materia[]>('/api/materias')).data });
}

export function useDocentes() {
  return useQuery({ queryKey: ['docentes'], queryFn: async () => (await api.get<Docente[]>('/api/usuarios?rol=Docente')).data });
}

export function usePeriodos() {
  return useQuery({ queryKey: ['periodos'], queryFn: async () => (await api.get<Periodo[]>('/api/periodos')).data });
}

export function useCrearGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { plantelId: string; nombre: string; semestre: number }) => (await api.post('/api/grupos', vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  });
}

export function useCrearPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { plantelId: string; codigo: string; fechaInicio: string; fechaFin: string }) =>
      (await api.post('/api/periodos', vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}

export function useActivarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/api/periodos/${id}/activar`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}

export function useCrearCurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { materiaId: string; grupoId: string; docenteId: string; periodoId: string }) =>
      (await api.post('/api/cursos', vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cursos'] }),
  });
}
