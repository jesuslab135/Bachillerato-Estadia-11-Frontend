import { AppShell as MantineAppShell, Anchor, Box, Burger, Button, Container, Drawer, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { IndicadorCola } from './IndicadorCola';

const MAX_ANCHO = 1280;
const ALTO_HEADER = 62;

// Iniciales para el avatar a partir del correo institucional (no hay nombre en el JWT).
function iniciales(email: string | undefined): string {
  if (!email) return '··';
  const base = email.split('@')[0];
  const partes = base.split(/[.\-_]+/).filter(Boolean);
  const dos = partes.length >= 2 ? partes[0][0] + partes[1][0] : base.slice(0, 2);
  return dos.toUpperCase();
}

// Tile del logo: gradiente navy + borde dorado + estrella ceremonial. Decorativo (aria-hidden).
function LogoTile({ size = 36 }: { size?: number }) {
  return (
    <Box
      aria-hidden
      className="sga-logo-tile"
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        boxShadow: '0 2px 6px rgba(11,30,64,.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <span style={{ color: 'var(--sga-gold)', fontSize: size * 0.28, lineHeight: 1 }}>★</span>
      <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: size * 0.24, color: '#fff', letterSpacing: '.02em' }}>SGA</span>
    </Box>
  );
}

function NavPill({ to, etiqueta, activo, onClick }: { to: string; etiqueta: string; activo: boolean; onClick?: () => void }) {
  return (
    <Anchor
      component={Link}
      to={to}
      onClick={onClick}
      underline="never"
      className="sga-nav-pill"
      data-activo={activo || undefined}
      style={{
        padding: '7px 13px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: activo ? 600 : 500,
        color: activo ? 'var(--sga-primary)' : 'var(--sga-text-body)',
        background: activo ? 'var(--sga-primary-tint)' : 'transparent',
      }}
    >
      {etiqueta}
    </Anchor>
  );
}

// Footer institucional navy — única superficie oscura del sistema.
function FooterOscuro() {
  return (
    <Box component="footer" className="sga-navy-panel">
      <Container size={MAX_ANCHO} py={28} px={28}>
        <Group justify="space-between" wrap="wrap" gap="sm">
          <div>
            <Text c="#ffffff" fw={700} fz={16} ff="Archivo" style={{ letterSpacing: '-0.02em' }}>
              SGA-Militar
            </Text>
            <Text fz={13} mt={2} c="#93c5fd">
              Sistema de Gestión Académica Multi-Plantel · uso interno
            </Text>
          </div>
          <Text fz={12} c="#6f97cf">
            v1.0 · Uso interno
          </Text>
        </Group>
      </Container>
    </Box>
  );
}

export function AppShell() {
  const { sesion, salir } = useAuth();
  const [drawerAbierto, { open: abrirDrawer, close: cerrarDrawer }] = useDisclosure(false);
  const { pathname } = useLocation();
  const esActivo = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  // Mismo mapa rol→links para header (≥sm) y drawer (<sm); espejo de las rutas con roles (FB-F-14).
  const links = [
    { to: '/', etiqueta: 'Inicio' },
    { to: '/cursos', etiqueta: 'Cursos' },
    ...(sesion && sesion.rol !== 'Docente'
      ? [
          { to: '/cadetes', etiqueta: 'Cadetes' },
          { to: '/catalogos', etiqueta: 'Catálogos' },
        ]
      : []),
  ];

  return (
    <MantineAppShell header={{ height: ALTO_HEADER }} padding={0}>
      <MantineAppShell.Header style={{ borderBottom: '1px solid var(--sga-divider)' }}>
        <Container size={MAX_ANCHO} h="100%" px={28}>
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap={28} wrap="nowrap">
              <Burger opened={drawerAbierto} onClick={abrirDrawer} hiddenFrom="sm" size="sm" aria-label="Abrir menú de navegación" />
              <Anchor component={Link} to="/" underline="never" aria-label="SGA-Militar" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LogoTile />
                <Text component="span" ff="Archivo" fw={700} fz={16} c="var(--sga-text-strong)" style={{ letterSpacing: '-0.02em' }} visibleFrom="xs">
                  SGA-Militar
                </Text>
              </Anchor>
              <Group gap={4} visibleFrom="sm" wrap="nowrap">
                {links.map((l) => (
                  <NavPill key={l.to} to={l.to} etiqueta={l.etiqueta} activo={esActivo(l.to)} />
                ))}
              </Group>
            </Group>
            <Group gap={16} wrap="nowrap">
              <IndicadorCola />
              <Group gap={10} wrap="nowrap" visibleFrom="md" style={{ paddingLeft: 16, borderLeft: '1px solid var(--sga-divider)' }}>
                <Box
                  aria-hidden
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--sga-navy)',
                    color: '#fff',
                    fontFamily: 'Archivo',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  {iniciales(sesion?.email)}
                </Box>
                <div>
                  <Text fz={13} fw={600} c="var(--sga-text-strong)" lh={1.2}>
                    {sesion?.email}
                  </Text>
                  <Text fz={11.5} c="var(--sga-text-faint)" lh={1.2}>
                    {sesion?.rol}
                  </Text>
                </div>
              </Group>
              <Button variant="light" color="slate" size="xs" onClick={salir}>
                Salir
              </Button>
            </Group>
          </Group>
        </Container>
      </MantineAppShell.Header>

      <Drawer opened={drawerAbierto} onClose={cerrarDrawer} title="SGA-Militar" size="xs" padding="md">
        <Stack gap="xs">
          {links.map((l) => (
            <NavPill key={l.to} to={l.to} etiqueta={l.etiqueta} activo={esActivo(l.to)} onClick={cerrarDrawer} />
          ))}
          <Text size="xs" c="dimmed" mt="sm">
            {sesion?.email} · {sesion?.rol}
          </Text>
          <Button
            variant="light"
            color="slate"
            size="xs"
            onClick={() => {
              cerrarDrawer();
              salir();
            }}
          >
            Salir
          </Button>
        </Stack>
      </Drawer>

      {/* FB-F-15: se conserva 100dvh — coincide con el min-height por defecto de Mantine
          (border-box: la altura total es exactamente el viewport, el padding-top del header
          cuenta dentro). calc(100dvh - 62px) dejaría el footer corto (regresión FB-F-3). */}
      <MantineAppShell.Main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        <Container size={MAX_ANCHO} w="100%" py={40} px={28} style={{ flex: 1 }}>
          <Outlet />
        </Container>
        <FooterOscuro />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
