import { AppShell as MantineAppShell, Anchor, Button, Group, Text } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AppShell() {
  const { sesion, salir } = useAuth();

  return (
    <MantineAppShell header={{ height: 56 }} padding="md">
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text fw={700}>SGA-Militar</Text>
            <Anchor component={Link} to="/" size="sm">
              Panel
            </Anchor>
            <Anchor component={Link} to="/cursos" size="sm">
              Cursos
            </Anchor>
            {sesion && sesion.rol !== 'Docente' && (
              <>
                <Anchor component={Link} to="/cadetes" size="sm">
                  Cadetes
                </Anchor>
                <Anchor component={Link} to="/catalogos" size="sm">
                  Catálogos
                </Anchor>
              </>
            )}
          </Group>
          <Group>
            <Text size="sm" c="dimmed">
              {sesion?.email} · {sesion?.rol}
            </Text>
            <Button variant="light" size="xs" onClick={salir}>
              Salir
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
