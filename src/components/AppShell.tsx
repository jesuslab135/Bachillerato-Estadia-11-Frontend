import { AppShell as MantineAppShell, Anchor, Box, Burger, Button, Container, Drawer, Group, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { IndicadorCola } from './IndicadorCola';

const MAX_ANCHO = 1200;
const ALTO_HEADER = 56;

// Footer oscuro (#101010) que cierra la página — única superficie oscura del sistema (Cal.com).
function FooterOscuro() {
  return (
    <Box component="footer" style={{ background: '#0b1e40', color: '#93c5fd' }}>
      <Container size={MAX_ANCHO} py={40}>
        <Text c="#ffffff" fw={700} fz={18} style={{ letterSpacing: '-0.04em' }}>
          SGA-Militar
        </Text>
        <Text fz="sm" mt={4}>
          Sistema de Gestión Académica Multi-Plantel · uso interno
        </Text>
      </Container>
    </Box>
  );
}

export function AppShell() {
  const { sesion, salir } = useAuth();
  const [drawerAbierto, { open: abrirDrawer, close: cerrarDrawer }] = useDisclosure(false);

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
      <MantineAppShell.Header>
        <Container size={MAX_ANCHO} h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Burger opened={drawerAbierto} onClick={abrirDrawer} hiddenFrom="sm" size="sm" aria-label="Abrir menú de navegación" />
              <Anchor component={Link} to="/" underline="never" fw={700} c="brand.7" style={{ letterSpacing: '-0.04em' }}>
                SGA-Militar
              </Anchor>
              <Group gap="md" visibleFrom="sm">
                {links.map((l) => (
                  <Anchor key={l.to} component={Link} to={l.to} size="sm" c="slate.9" fw={500} underline="never">
                    {l.etiqueta}
                  </Anchor>
                ))}
              </Group>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <IndicadorCola />
              <Text size="sm" c="dimmed" visibleFrom="md">
                {sesion?.email} · {sesion?.rol}
              </Text>
              <Button variant="light" size="xs" onClick={salir}>
                Salir
              </Button>
            </Group>
          </Group>
        </Container>
      </MantineAppShell.Header>

      <Drawer opened={drawerAbierto} onClose={cerrarDrawer} title="SGA-Militar" size="xs" padding="md">
        <Stack gap="sm">
          {links.map((l) => (
            <Anchor key={l.to} component={Link} to={l.to} c="slate.9" fw={500} underline="never" onClick={cerrarDrawer}>
              {l.etiqueta}
            </Anchor>
          ))}
          <Text size="xs" c="dimmed">
            {sesion?.email} · {sesion?.rol}
          </Text>
          <Button
            variant="light"
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
          cuenta dentro). calc(100dvh - 56px) dejaría el footer 56px corto (regresión FB-F-3). */}
      <MantineAppShell.Main
        style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}
      >
        <Container size={MAX_ANCHO} w="100%" py={48} style={{ flex: 1 }}>
          <Outlet />
        </Container>
        <FooterOscuro />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
