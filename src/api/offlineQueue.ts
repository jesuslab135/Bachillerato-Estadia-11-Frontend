import { api } from './client';

// RF-ASIS-06 (primer pase): la captura sin conexión se persiste local y se sincroniza al
// volver la red. El backend hace upsert por (cadete,curso,fecha) ⇒ gana la última escritura.
const KEY = 'sga_pending_asistencia';

export interface CapturaPendiente {
  cursoId: string;
  fecha: string;
  registros: { cadeteMatricula: string; codigo: string }[];
}

function leer(): CapturaPendiente[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CapturaPendiente[];
  } catch {
    return [];
  }
}

function escribir(q: CapturaPendiente[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function encolar(item: CapturaPendiente) {
  escribir([...leer(), item]);
}

export function pendientes(): number {
  return leer().length;
}

/** Reintenta las capturas pendientes; conserva las que sigan fallando. Devuelve cuántas sincronizó. */
export async function sincronizar(): Promise<number> {
  const cola = leer();
  const restantes: CapturaPendiente[] = [];
  for (const item of cola) {
    try {
      await api.post(`/api/cursos/${item.cursoId}/asistencia`, { fecha: item.fecha, registros: item.registros });
    } catch {
      restantes.push(item);
    }
  }
  escribir(restantes);
  return cola.length - restantes.length;
}
