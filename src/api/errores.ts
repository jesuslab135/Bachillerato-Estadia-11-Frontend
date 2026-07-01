import { AxiosError } from 'axios';

/** Extrae el mensaje de error de la API (NestJS: `message` string o string[]). */
export function mensajeError(e: unknown, porDefecto: string): string {
  if (e instanceof AxiosError) {
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return porDefecto;
}
