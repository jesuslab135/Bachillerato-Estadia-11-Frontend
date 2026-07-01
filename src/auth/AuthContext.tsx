import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api/client';
import { decodificarSesion, type Sesion } from './jwt';

interface AuthContextValor {
  sesion: Sesion | null;
  ingresar: (email: string, password: string) => Promise<Sesion>;
  refrescar: (token: string) => void;
  salir: () => void;
}

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const t = tokenStore.get();
    return t ? decodificarSesion(t) : null;
  });

  const aplicarToken = useCallback((token: string) => {
    tokenStore.set(token);
    const s = decodificarSesion(token);
    setSesion(s);
    return s;
  }, []);

  const ingresar = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ accessToken: string; debeCambiarContrasena: boolean }>('/api/auth/login', { email, password });
      const s = aplicarToken(data.accessToken);
      if (!s) throw new Error('Token inválido');
      return s;
    },
    [aplicarToken],
  );

  const salir = useCallback(() => {
    tokenStore.clear();
    setSesion(null);
  }, []);

  const valor = useMemo<AuthContextValor>(() => ({ sesion, ingresar, refrescar: aplicarToken, salir }), [sesion, ingresar, aplicarToken, salir]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
