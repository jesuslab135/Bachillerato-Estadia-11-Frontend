import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export type TipoRecuperacion = 'Ordinario' | 'Extraordinario' | 'TDS';

export interface FilaActa {
  matricula: string;
  nombreCompleto: string;
  estatus: string;
  parciales: (number | 'NP')[];
  ordinario: number | 'NP' | null;
  extraordinario: number | 'NP' | null;
  tds: number | 'NP' | null;
  observacion: string;
  calificacionFinal: number;
}

export interface Acta {
  version: number;
  generadaEn: string;
  firmadaDocenteEn: string | null;
  firmadaCoordinacionEn: string | null;
  hashPdf: string | null;
  cadetes: FilaActa[];
}

/** Deriva el tipo de recuperación que un cadete puede presentar según su observación (RN-04). */
export function recuperacionElegible(observacion: string): TipoRecuperacion | null {
  switch (observacion) {
    case 'Presenta Ordinario':
      return 'Ordinario';
    case 'Presenta Extraordinario':
      return 'Extraordinario';
    case 'Habilita TDS':
      return 'TDS';
    default:
      return null;
  }
}

export function useActa(cursoId: string) {
  return useQuery({
    queryKey: ['acta', cursoId],
    retry: false,
    queryFn: async () => (await api.get<Acta>(`/api/cursos/${cursoId}/acta`)).data,
  });
}

export function useFirmarActa(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post(`/api/cursos/${cursoId}/acta/firmar`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acta', cursoId] }),
  });
}

export function useExportarActa(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.get<{ version: number; hash: string }>(`/api/cursos/${cursoId}/acta/export`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acta', cursoId] }),
  });
}

export function useCapturarRecuperacion(cursoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { cadeteMatricula: string; tipo: TipoRecuperacion; valor: number }) =>
      (await api.post(`/api/cursos/${cursoId}/acta/recuperacion`, vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acta', cursoId] }),
  });
}
