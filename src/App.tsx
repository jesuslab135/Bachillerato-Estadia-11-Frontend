import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { CambiarContrasenaPage } from './pages/CambiarContrasenaPage';
import { PanelPage } from './pages/PanelPage';
import { CursosPage } from './pages/CursosPage';
import { AsistenciaPage } from './pages/AsistenciaPage';
import { ActaPage } from './pages/ActaPage';
import { ParcialesPage } from './pages/ParcialesPage';
import { CalificacionesPage } from './pages/CalificacionesPage';
import { CadetesPage } from './pages/CadetesPage';
import { CatalogosPage } from './pages/CatalogosPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cambiar-contrasena" element={<CambiarContrasenaPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<PanelPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          {/* FB-F-14: gestión de cadetes y catálogos solo Coordinador/Operador (espejo de AppShell.links) */}
          <Route element={<ProtectedRoute roles={['Coordinador', 'Operador']} />}>
            <Route path="/cadetes" element={<CadetesPage />} />
            <Route path="/catalogos" element={<CatalogosPage />} />
          </Route>
          <Route path="/cursos/:cursoId/asistencia" element={<AsistenciaPage />} />
          <Route path="/cursos/:cursoId/parciales" element={<ParcialesPage />} />
          <Route path="/cursos/:cursoId/calificaciones" element={<CalificacionesPage />} />
          <Route path="/cursos/:cursoId/acta" element={<ActaPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
