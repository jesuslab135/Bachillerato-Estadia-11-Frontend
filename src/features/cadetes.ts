import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export type EstatusCadete = 'Activo' | 'BajaTemporal' | 'BajaDefinitiva';
export const ESTATUS: EstatusCadete[] = ['Activo', 'BajaTemporal', 'BajaDefinitiva'];

export interface Grupo {
  id: string;
  nombre: string;
  semestre: number;
}

export interface Cadete {
  matricula: string;
  nombreCompleto: string;
  estatus: EstatusCadete;
  grupoActualId: string | null;
}

export interface ResultadoImport {
  insertados: number;
  errores: { indice: number; matricula: string | null; motivo: string }[];
}

/** Resumen legible del resultado de una importación. */
export function resumenImport(r: ResultadoImport): string {
  return `${r.insertados} insertado(s), ${r.errores.length} con error`;
}

export function useGrupos() {
  return useQuery({ queryKey: ['grupos'], queryFn: async () => (await api.get<Grupo[]>('/api/grupos')).data });
}

export function useCadetes(grupoId: string | null) {
  return useQuery({
    queryKey: ['cadetes', grupoId],
    enabled: !!grupoId,
    queryFn: async () => (await api.get<Cadete[]>(`/api/cadetes?grupoId=${grupoId}`)).data,
  });
}

export function useCrearCadete(grupoId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { matricula: string; nombreCompleto: string }) =>
      (await api.post('/api/cadetes', { ...vars, grupoId })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cadetes', grupoId] }),
  });
}

export function useActualizarCadete(grupoId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { matricula: string; estatus: EstatusCadete }) =>
      (await api.patch(`/api/cadetes/${vars.matricula}`, { estatus: vars.estatus })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cadetes', grupoId] }),
  });
}

export function useImportarCadetes(grupoId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // FB-F-7: el grupo seleccionado va como defecto; una columna grupoId en el CSV lo sobreescribe.
    mutationFn: async (csv: string) =>
      (await api.post<ResultadoImport>('/api/cadetes/import', { csv, grupoIdPorDefecto: grupoId ?? undefined })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cadetes', grupoId] }),
  });
}

export function useImportarArchivo(grupoId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (archivo: File) => {
      const fd = new FormData();
      fd.append('archivo', archivo);
      const url = grupoId ? `/api/cadetes/import/archivo?grupoId=${encodeURIComponent(grupoId)}` : '/api/cadetes/import/archivo';
      return (await api.post<ResultadoImport>(url, fd)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cadetes', grupoId] }),
  });
}
