import { Badge, Card, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCalendarStats, IconChecklist, IconSettings, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface CursoPanel {
  cursoId: string;
  materia: { clave: string; nombre: string };
  grupo: { nombre: string };
  parcialesAbiertos: number[];
  asistenciaHoy: { capturada: boolean; registros: number };
  cierresProximos: { parcial: number; fechaFin: string }[];
}

interface Acceso {
  to: string;
  icon: typeof IconCalendarStats;
  title: string;
  desc: string;
}

function AccesoCard({ acceso }: { acceso: Acceso }) {
  const Icon = acceso.icon;
  return (
    <Card
      component={Link}
      to={acceso.to}
      withBorder
      padding="xl"
      radius="lg"
      className="sga-card-hover"
      style={{ background: '#f8fafc', textDecoration: 'none' }}
    >
      <ThemeIcon variant="light" color="brand" size={44} radius="md">
        <Icon size={22} stroke={1.8} />
      </ThemeIcon>
      <Text fw={600} fz={18} mt="md" c="slate.9" style={{ letterSpacing: '-0.02em' }}>
        {acceso.title}
      </Text>
      <Text c="dimmed" fz="sm" mt={4}>
        {acceso.desc}
      </Text>
    </Card>
  );
}

export function PanelPage() {
  const { sesion } = useAuth();
  const esDocente = sesion?.rol === 'Docente';
  const esCoordOp = !!sesion && sesion.rol !== 'Docente';

  // FB-F-14: el panel es un endpoint de docente — no se llama para Coordinador/Operador, y la
  // clave se scopea por usuario para no filtrar datos entre sesiones en la misma máquina.
  const { data, isLoading } = useQuery({
    queryKey: ['panel-docente', sesion?.sub],
    enabled: esDocente,
    queryFn: async () => (await api.get<{ cursos: CursoPanel[] }>('/api/docente/panel')).data,
  });
  const cursos = data?.cursos ?? [];

  const accesos: Acceso[] = [
    { to: '/cursos', icon: IconCalendarStats, title: 'Cursos', desc: 'Asistencia, calificaciones, ponderación y acta.' },
    ...(esCoordOp
      ? [
          { to: '/cadetes', icon: IconUsers, title: 'Cadetes', desc: 'Alta, estatus e importación por CSV.' },
          { to: '/catalogos', icon: IconSettings, title: 'Catálogos', desc: 'Grupos, periodos y creación de cursos.' },
        ]
      : []),
  ];

  return (
    <Stack gap={48} className="sga-anim-in">
      <div>
        <Title order={2}>Inicio</Title>
        <Text c="dimmed" mt={6}>
          {sesion?.email} · {sesion?.rol}
        </Text>
      </div>

      <div>
        <Title order={4} mb="md">
          Accesos rápidos
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {accesos.map((a) => (
            <AccesoCard key={a.to} acceso={a} />
          ))}
        </SimpleGrid>
      </div>

      <div>
        <Group gap="xs" mb="md">
          <IconChecklist size={20} stroke={1.8} />
          <Title order={4}>Mis cursos como docente</Title>
        </Group>

        {isLoading && <Loader size="sm" />}

        {!isLoading && cursos.length === 0 && (
          <Card padding="xl" radius="lg" style={{ background: '#f5f5f5' }}>
            <Text c="dimmed">
              {esDocente
                ? 'Aún no tienes cursos asignados. Cuando Coordinación te asigne uno, aparecerá aquí.'
                : 'No impartes cursos como docente. Gestiona los cursos del plantel desde Cursos y Catálogos.'}
            </Text>
          </Card>
        )}

        {cursos.length > 0 && (
          <Stack gap="md">
            {cursos.map((c) => (
              <Card key={c.cursoId} withBorder radius="lg" padding="lg" className="sga-card-hover">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} style={{ letterSpacing: '-0.02em' }}>
                    {c.materia.clave} — {c.materia.nombre} · {c.grupo.nombre}
                  </Text>
                  <Badge variant="light" color={c.asistenciaHoy.capturada ? 'teal' : 'gray'}>
                    {c.asistenciaHoy.capturada ? `Asistencia hoy: ${c.asistenciaHoy.registros}` : 'Sin asistencia hoy'}
                  </Badge>
                </Group>
                <Group mt="xs" gap="sm">
                  <Text size="sm" c="dimmed">
                    Parciales abiertos: {c.parcialesAbiertos.join(', ') || '—'}
                  </Text>
                  {c.cierresProximos.length > 0 && (
                    <Badge variant="light" color="orange">
                      Cierres próximos: {c.cierresProximos.map((x) => x.parcial).join(', ')}
                    </Badge>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
