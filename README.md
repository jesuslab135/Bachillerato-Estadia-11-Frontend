# SGA-Militar — frontend (I9)

PWA en **Vite + React + TypeScript**, con **Mantine** (componentes/a11y) + **Tailwind**
(utilidades y tema azul institucional #1d4ed8, `preflight:false` para convivir con Mantine) y
**TanStack Query** (server-state). Consume la API NestJS de `../backend` (prefijo `/api`).
Todas las dependencias se instalan con `npm install` (incluye Tailwind/PostCSS); sin pasos manuales.

## Requisitos
- Node 20+. El backend debe correr en `http://localhost:3000` (ver `../backend/README.md`).

## Puesta en marcha
```powershell
copy .env.example .env      # VITE_API_URL vacío en dev (usa el proxy de Vite)
npm install
npm run dev                 # http://localhost:5173  (proxy /api → :3000)
npm run build               # tsc -b + vite build (genera PWA/service worker)
npm run typecheck           # solo verificación de tipos
npm test                    # Vitest + Testing Library (jsdom)
```

## Estructura
```
src/
  api/        client axios (baseURL + Bearer + 401→login) y helpers de error
  auth/       AuthContext (sesión desde JWT) + decodificación del token
  routes/     ProtectedRoute (exige sesión; fuerza cambio de contraseña, RF-AUTH-04)
  components/ AppShell (cabecera + salir)
  pages/      LoginPage, CambiarContrasenaPage, PanelPage (panel docente)
  theme.ts    tema Mantine
  main.tsx    providers: Mantine + QueryClient + Auth + Router
```

## Estado (slices de I9)
- [x] **Andamiaje** Vite + Mantine + TanStack Query + Router + PWA (build verde).
- [x] **Auth**: login (RF-AUTH-01), cambio de contraseña obligatorio (RF-AUTH-04),
  rutas protegidas, cierre de sesión. Token JWT en `localStorage`, `Bearer` automático,
  401 → `/login`.
- [x] **Panel del docente** (RF-ASIG-04) leyendo `/api/docente/panel`.
- [x] **Captura de asistencia**: lista de cursos, cuadrícula por fecha con códigos A/F/R/J,
  SDE/contadores en tiempo real por parcial (RN-01, resalta baja definitiva RN-05), y cola
  **offline** (`src/api/offlineQueue.ts`) que sincroniza al reconectar (primer pase RF-ASIS-06).
- [x] **Arnés de pruebas** Vitest + Testing Library + jsdom (`vitest.config.ts`,
  `src/test/`): decodificación JWT, cola offline, flujo de login, elegibilidad de
  recuperación (11 pruebas verdes).
- [x] **Acta semestral** (RN-04): vista de finales/observaciones, doble firma, exportación
  con hash y captura de recuperación (Ordinario/Extra/TDS) para cadetes elegibles.
- [x] **Ponderación + workflow del parcial**: edición de pesos con validación RN-02 en
  cliente, y acciones cerrar/validar/devolver/reabrir según estado y rol (RF-POND/RF-WF).
- [x] **Captura de calificaciones/examen**: crear actividades, capturar calificaciones por
  actividad y examen (valor/NP, deshabilita SDE), con resultado del parcial en vivo (GET
  matriz + calculo, RF-CAL). Falta la cuadrícula avanzada pegar/teclado (RF-CAL-05).
- [x] **Admin de cadetes** (Coord/Op): lista por grupo, alta, cambio de estatus (RN-05) e
  importación CSV con reporte de duplicadas/errores (RF-CAT-07).
- [x] **Admin de catálogos** (Coord/Op): grupos, periodos (con activación RF-CAT-04) y alta
  de cursos (materia×grupo×docente×periodo); Operador elige plantel.
- [x] **Pruebas de componente (render)**: AsistenciaPage (alerta SDE RN-01, resalta/bloquea
  baja definitiva RN-05) y CadetesPage; con etiquetas accesibles (aria-label) en los controles.
- [ ] Cuadrícula avanzada de calificaciones (pegar/atajos, RF-CAL-05).
- [ ] Auditoría formal de a11y (WCAG 2.1 AA, p. ej. jest-axe) y cobertura render del resto de pantallas.
