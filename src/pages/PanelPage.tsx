import { Alert, Card, Group, Loader, Stack, Text, Title, Badge } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface CursoPanel {
  cursoId: string;
  materia: { clave: string; nombre: string };
  grupo: { nombre: string };
  parcialesAbiertos: number[];
  asistenciaHoy: { capturada: boolean; registros: number };
  cierresProximos: { parcial: number; fechaFin: string }[];
}

export function PanelPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['panel-docente'],
    queryFn: async () => (await api.get<{ cursos: CursoPanel[] }>('/api/docente/panel')).data,
  });

  if (isLoading) return <Loader />;
  if (isError) return <Alert color="red">No fue posible cargar el panel.</Alert>;

  const cursos = data?.cursos ?? [];
  return (
    <Stack>
      <Title order={3}>Panel del docente</Title>
      {cursos.length === 0 && <Text c="dimmed">No tienes cursos asignados.</Text>}
      {cursos.map((c) => (
        <Card key={c.cursoId} withBorder radius="md">
          <Group justify="space-between">
            <Text fw={600}>
              {c.materia.clave} — {c.materia.nombre} · {c.grupo.nombre}
            </Text>
            <Badge color={c.asistenciaHoy.capturada ? 'green' : 'gray'}>
              {c.asistenciaHoy.capturada ? `Asistencia hoy: ${c.asistenciaHoy.registros}` : 'Sin asistencia hoy'}
            </Badge>
          </Group>
          <Group mt="xs" gap="xs">
            <Text size="sm" c="dimmed">
              Parciales abiertos: {c.parcialesAbiertos.join(', ') || '—'}
            </Text>
            {c.cierresProximos.length > 0 && (
              <Badge color="orange" variant="light">
                Cierres próximos: {c.cierresProximos.map((x) => x.parcial).join(', ')}
              </Badge>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
