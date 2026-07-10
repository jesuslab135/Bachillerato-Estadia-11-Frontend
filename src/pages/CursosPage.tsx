import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Group, Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useCursos } from '../features/asistencia';
import { CourseAvatar } from '../components/ui';

const ACCIONES = [
  { seg: 'asistencia', etiqueta: 'Asistencia' },
  { seg: 'parciales', etiqueta: 'Parciales' },
  { seg: 'calificaciones', etiqueta: 'Calificaciones' },
  { seg: 'acta', etiqueta: 'Acta' },
];

export function CursosPage() {
  const { data, isLoading, isError } = useCursos();
  const [busqueda, setBusqueda] = useState('');

  const cursos = useMemo(() => {
    const lista = data ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((c) =>
      [c.materia.clave, c.materia.nombre, c.grupo.nombre].some((s) => s.toLowerCase().includes(q)),
    );
  }, [data, busqueda]);

  if (isLoading) return <Loader />;
  if (isError) return <Alert color="red">No fue posible cargar los cursos.</Alert>;

  const total = data?.length ?? 0;
  const periodo = data?.[0]?.periodo?.codigo;

  return (
    <Stack gap={24} className="sga-anim-in">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <div>
          <Title order={1}>Cursos</Title>
          <Text c="var(--sga-text-muted)" mt={6} fz={14}>
            {total} curso{total === 1 ? '' : 's'}
            {periodo ? ` · Periodo ${periodo}` : ''}
          </Text>
        </div>
        <TextInput
          w={260}
          placeholder="Buscar materia o grupo"
          leftSection={<IconSearch size={16} />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          aria-label="Buscar cursos"
        />
      </Group>

      {total === 0 && <Text c="var(--sga-text-muted)">No hay cursos visibles para tu plantel.</Text>}
      {total > 0 && cursos.length === 0 && <Text c="var(--sga-text-muted)">Ningún curso coincide con «{busqueda}».</Text>}

      <Stack gap={14}>
        {cursos.map((c, i) => (
          <Card key={c.id} withBorder radius="lg" padding="18px 22px" shadow="xs" className="sga-card-hover">
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group wrap="nowrap" gap="md" style={{ minWidth: 0 }}>
                <CourseAvatar code={c.materia.clave} destacado={i === 0} />
                <Box style={{ minWidth: 0 }}>
                  <Text fw={600} fz={16} c="var(--sga-text-strong)" truncate style={{ letterSpacing: '-0.01em' }}>
                    {c.materia.nombre}
                  </Text>
                  <Text fz={13} c="var(--sga-text-faint)" truncate>
                    {c.materia.clave} · {c.grupo.nombre}
                  </Text>
                </Box>
              </Group>
              <Group gap={8} wrap="wrap" justify="flex-end">
                {ACCIONES.map((a) => (
                  <Button key={a.seg} component={Link} to={`/cursos/${c.id}/${a.seg}`} variant="light" color="brand" size="xs">
                    {a.etiqueta}
                  </Button>
                ))}
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
