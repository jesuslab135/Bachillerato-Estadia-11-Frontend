import { api, tokenStore } from './client';
import { queryClient } from './queryClient';

// RF-ASIS-06: la captura sin conexión se persiste local y se sincroniza al volver la red.
// El backend hace upsert por (cadete,curso,fecha) ⇒ gana la última escritura.
// FB-F-11: un rechazo del servidor (4xx) NO se reencola — pasa a la lista de rechazadas con su
// motivo; solo errores de red/5xx reintentan. Sin token no se sincroniza (el replay fallaría 401).
const KEY = 'sga_pending_asistencia';
const KEY_RECHAZADAS = 'sga_rechazadas_asistencia';

export interface CapturaPendiente {
  cursoId: string;
  fecha: string;
  registros: { cadeteMatricula: string; codigo: string }[];
}

export interface CapturaRechazada extends CapturaPendiente {
  motivo: string;
  rechazadaEn: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Suscribe un componente a cambios de la cola (encolar/sincronizar/limpiar). */
export function suscribirCola(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notificarCambio() {
  listeners.forEach((l) => l());
}

function leerLista<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function leer(): CapturaPendiente[] {
  return leerLista<CapturaPendiente>(KEY);
}

function escribir(q: CapturaPendiente[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function encolar(item: CapturaPendiente) {
  escribir([...leer(), item]);
  notificarCambio();
}

export function pendientes(): number {
  return leer().length;
}

export function rechazadas(): CapturaRechazada[] {
  return leerLista<CapturaRechazada>(KEY_RECHAZADAS);
}

export function limpiarRechazadas() {
  localStorage.removeItem(KEY_RECHAZADAS);
  notificarCambio();
}

interface RespuestaError {
  response?: { status?: number; data?: { message?: string | string[] } };
}

function motivoServidor(e: unknown, status: number): string {
  const msg = (e as RespuestaError).response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return `El servidor rechazó la captura (HTTP ${status})`;
}

/**
 * Reintenta las capturas pendientes. 4xx ⇒ descarta hacia rechazadas (con motivo del servidor);
 * error de red o 5xx ⇒ se conserva para reintentar. Devuelve cuántas sincronizó.
 */
export async function sincronizar(): Promise<number> {
  if (!tokenStore.get()) return 0;
  const cola = leer();
  if (cola.length === 0) return 0;

  const restantes: CapturaPendiente[] = [];
  const nuevasRechazadas: CapturaRechazada[] = [];
  for (const item of cola) {
    try {
      await api.post(`/api/cursos/${item.cursoId}/asistencia`, { fecha: item.fecha, registros: item.registros });
    } catch (e) {
      const status = (e as RespuestaError).response?.status;
      if (status !== undefined && status >= 400 && status < 500) {
        nuevasRechazadas.push({ ...item, motivo: motivoServidor(e, status), rechazadaEn: new Date().toISOString() });
      } else {
        restantes.push(item);
      }
    }
  }

  escribir(restantes);
  if (nuevasRechazadas.length > 0) {
    localStorage.setItem(KEY_RECHAZADAS, JSON.stringify([...rechazadas(), ...nuevasRechazadas]));
  }
  notificarCambio();

  const sincronizadas = cola.length - restantes.length - nuevasRechazadas.length;
  if (sincronizadas > 0) {
    void queryClient.invalidateQueries({ queryKey: ['asistencia'] });
    void queryClient.invalidateQueries({ queryKey: ['resumen'] });
  }
  return sincronizadas;
}
