import { AppShell as MantineAppShell, Anchor, Box, Button, Container, Group, Text } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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

  return (
    <MantineAppShell header={{ height: ALTO_HEADER }} padding={0}>
      <MantineAppShell.Header>
        <Container size={MAX_ANCHO} h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Text fw={700} c="brand.7" style={{ letterSpacing: '-0.04em' }}>
                SGA-Militar
              </Text>
              <Group gap="md" visibleFrom="sm">
                <Anchor component={Link} to="/" size="sm" c="slate.9" fw={500} underline="never">
                  Inicio
                </Anchor>
                <Anchor component={Link} to="/cursos" size="sm" c="slate.9" fw={500} underline="never">
                  Cursos
                </Anchor>
                {sesion && sesion.rol !== 'Docente' && (
                  <>
                    <Anchor component={Link} to="/cadetes" size="sm" c="slate.9" fw={500} underline="never">
                      Cadetes
                    </Anchor>
                    <Anchor component={Link} to="/catalogos" size="sm" c="slate.9" fw={500} underline="never">
                      Catálogos
                    </Anchor>
                  </>
                )}
              </Group>
            </Group>
            <Group gap="sm" wrap="nowrap">
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
