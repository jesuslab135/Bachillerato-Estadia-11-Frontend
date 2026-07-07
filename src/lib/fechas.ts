// FB-F-9: la fecha "de hoy" debe ser el día lectivo local del plantel (America/Mexico_City),
// no el corte UTC — después de las 18:00 locales toISOString() ya devuelve mañana.
const ZONA_PLANTEL = 'America/Mexico_City';

/** Fecha de hoy en formato YYYY-MM-DD en la zona horaria del plantel. */
export function hoyLocalISO(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_PLANTEL }).format(ahora);
}
