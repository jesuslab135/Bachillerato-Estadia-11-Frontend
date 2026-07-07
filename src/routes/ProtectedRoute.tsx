import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Rol } from '../auth/jwt';

/**
 * Exige sesión; si hay cambio de contraseña pendiente (RF-AUTH-04), fuerza esa ruta.
 * FB-F-14: `roles` restringe la ruta a esos roles (defensa en profundidad; el servidor manda).
 */
export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.debeCambiar && location.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />;
  }
  if (roles && !roles.includes(sesion.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}
