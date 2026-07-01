import { Alert, Card, Group, Loader, Stack, Text, Title, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useCursos } from '../features/asistencia';

export function CursosPage() {
  const { data, isLoading, isError } = useCursos();

  if (isLoading) return <Loader />;
  if (isError) return <Alert color="red">No fue posible cargar los cursos.</Alert>;

  const cursos = data ?? [];
  return (
    <Stack>
      <Title order={3}>Cursos</Title>
      {cursos.length === 0 && <Text c="dimmed">No hay cursos visibles para tu plantel.</Text>}
      {cursos.map((c) => (
        <Card key={c.id} withBorder radius="md">
          <Group justify="space-between">
            <Text fw={600}>
              {c.materia.clave} — {c.materia.nombre} · {c.grupo.nombre}
            </Text>
            <Group gap="xs">
              <Button component={Link} to={`/cursos/${c.id}/asistencia`} variant="light" size="xs">
                Asistencia
              </Button>
              <Button component={Link} to={`/cursos/${c.id}/parciales`} variant="light" size="xs" color="teal">
                Parciales
              </Button>
              <Button component={Link} to={`/cursos/${c.id}/calificaciones`} variant="light" size="xs" color="cyan">
                Calificaciones
              </Button>
              <Button component={Link} to={`/cursos/${c.id}/acta`} variant="light" size="xs" color="grape">
                Acta
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
