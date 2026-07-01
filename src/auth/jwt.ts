export type Rol = 'Docente' | 'Coordinador' | 'Operador';

export interface Sesion {
  sub: string;
  email: string;
  rol: Rol;
  plantelId: string | null;
  debeCambiar: boolean;
}

/** Decodifica el payload del JWT (sin verificar firma — solo para poblar la UI). */
export function decodificarSesion(token: string): Sesion | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const p = JSON.parse(json) as Partial<Sesion>;
    if (!p.sub || !p.rol) return null;
    return {
      sub: p.sub,
      email: p.email ?? '',
      rol: p.rol,
      plantelId: p.plantelId ?? null,
      debeCambiar: p.debeCambiar ?? false,
    };
  } catch {
    return null;
  }
}
