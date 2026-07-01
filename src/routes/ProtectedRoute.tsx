import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Exige sesión; si hay cambio de contraseña pendiente (RF-AUTH-04), fuerza esa ruta. */
export function ProtectedRoute() {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.debeCambiar && location.pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />;
  }
  return <Outlet />;
}
