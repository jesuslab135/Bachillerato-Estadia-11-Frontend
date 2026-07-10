import { Box, Card, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconArrowRight,
  IconCalendar,
  IconCalendarStats,
  IconChecklist,
  IconClock,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { StatusPill } from '../components/ui';

interface CursoPanel {
  cursoId: string;
  materia: { clave: string; nombre: string };
  grupo: { nombre: string };
  parcialesAbiertos: number[];
  asistenciaHoy: { capturada: boolean; registros: number };
  cierresProximos: { parcial: number; fechaFin: string }[];
}

type Tono = 'blue' | 'teal' | 'amber';

const TILE: Record<Tono, { bg: string; fg: string }> = {
  blue: { bg: 'var(--sga-primary-tint)', fg: 'var(--sga-primary)' },
  teal: { bg: '#ecfdf5', fg: '#0f766e' },
  amber: { bg: 'var(--sga-warning-bg)', fg: 'var(--sga-warning)' },
};

function StatCard({ label, valor, icon: Icon, tono }: { label: string; valor: string; icon: typeof IconCalendarStats; tono: Tono }) {
  const t = TILE[tono];
  return (
    <Card withBorder radius="lg" padding={20} shadow="xs">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Text fz={12.5} fw={500} c="var(--sga-text-muted)">
          {label}
        </Text>
        <Box aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon size={18} stroke={1.8} />
        </Box>
      </Group>
      <Text ff="Archivo" fw={700} fz={32} c="var(--sga-text-strong)" mt={10} style={{ letterSpacing: '-0.02em', lineHeight: 1 }}>
        {valor}
      </Text>
    </Card>
  );
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
    <Card component={Link} to={acceso.to} withBorder padding={24} radius="lg" shadow="xs" className="sga-card-hover" style={{ textDecoration: 'none' }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <ThemeIcon variant="light" color="brand" size={44} radius={11}>
          <Icon size={22} stroke={1.8} />
        </ThemeIcon>
        <IconArrowRight size={18} color="var(--sga-input-border)" />
      </Group>
      <Text ff="Archivo" fw={600} fz={17} mt="md" c="var(--sga-text-strong)" style={{ letterSpacing: '-0.01em' }}>
        {acceso.title}
      </Text>
      <Text c="var(--sga-text-muted)" fz={13.5} mt={4}>
        {acceso.desc}
      </Text>
    </Card>
  );
}

function CursoRow({ curso, destacado }: { curso: CursoPanel; destacado: boolean }) {
  const dias = (fechaFin: string) => Math.max(0, Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86_400_000));
  return (
    <Card withBorder radius="lg" padding="lg" shadow="xs" className="sga-card-hover">
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Group wrap="nowrap" gap="md" style={{ minWidth: 0 }}>
          <Box
            aria-hidden
            className={destacado ? 'sga-logo-tile' : undefined}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: destacado ? undefined : 'var(--sga-chip)',
              color: destacado ? '#fff' : 'var(--sga-text)',
              fontFamily: 'Archivo',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {curso.materia.clave}
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} fz={16} c="var(--sga-text-strong)" truncate style={{ letterSpacing: '-0.01em' }}>
              {curso.materia.nombre}
            </Text>
            <Text fz={13} c="var(--sga-text-faint)" truncate>
              {curso.materia.clave} · {curso.grupo.nombre}
            </Text>
          </Box>
        </Group>
        <Group gap={8} wrap="wrap" justify="flex-end">
          <StatusPill tono={curso.asistenciaHoy.capturada ? 'teal' : 'neutral'}>
            {curso.asistenciaHoy.capturada ? `Asistencia hoy: ${curso.asistenciaHoy.registros}` : 'Sin asistencia hoy'}
          </StatusPill>
          {curso.parcialesAbiertos.map((n) => (
            <StatusPill key={n} tono="blue">
              Parcial {n} abierto
            </StatusPill>
          ))}
          {curso.cierresProximos.map((x) => (
            <StatusPill key={x.parcial} tono="warning">
              Cierre P{x.parcial} en {dias(x.fechaFin)} días
            </StatusPill>
          ))}
        </Group>
      </Group>
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

  // Métricas reales derivadas del panel del docente (sin fabricar; Coord/Op no tienen endpoint de métricas).
  const parcialesAbiertos = cursos.reduce((n, c) => n + c.parcialesAbiertos.length, 0);
  const capturadasHoy = cursos.filter((c) => c.asistenciaHoy.capturada).length;
  const cierres = cursos.reduce((n, c) => n + c.cierresProximos.length, 0);

  const fechaHoy = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());

  return (
    <Stack gap={40} className="sga-anim-in">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div>
          <Title order={1}>Inicio</Title>
          <Text c="var(--sga-text-muted)" mt={6}>
            {sesion?.email} · {sesion?.rol}
          </Text>
        </div>
        <Group gap={9} style={{ border: '1px solid var(--sga-border)', borderRadius: 10, padding: '9px 15px' }}>
          <IconCalendar size={16} color="var(--sga-primary)" />
          <Text fz={13} c="var(--sga-text)" tt="capitalize">
            {fechaHoy}
          </Text>
        </Group>
      </Group>

      {esDocente && cursos.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={18}>
          <StatCard label="Mis cursos" valor={String(cursos.length)} icon={IconCalendarStats} tono="blue" />
          <StatCard label="Parciales abiertos" valor={String(parcialesAbiertos)} icon={IconChecklist} tono="blue" />
          <StatCard label="Asistencia hoy" valor={`${capturadasHoy}/${cursos.length}`} icon={IconUsers} tono="teal" />
          <StatCard label="Cierres próximos" valor={String(cierres)} icon={IconClock} tono="amber" />
        </SimpleGrid>
      )}

      <div>
        <Title order={5} mb="md">
          Accesos rápidos
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={18}>
          {accesos.map((a) => (
            <AccesoCard key={a.to} acceso={a} />
          ))}
        </SimpleGrid>
      </div>

      <div>
        <Group gap="xs" mb="md">
          <IconChecklist size={20} stroke={1.8} color="var(--sga-primary)" />
          <Title order={5}>Mis cursos como docente</Title>
        </Group>

        {isLoading && <Loader size="sm" />}

        {!isLoading && cursos.length === 0 && (
          <Card withBorder padding="xl" radius="lg" style={{ background: 'var(--sga-surface-subtle)' }}>
            <Text c="var(--sga-text-muted)">
              {esDocente
                ? 'Aún no tienes cursos asignados. Cuando Coordinación te asigne uno, aparecerá aquí.'
                : 'No impartes cursos como docente. Gestiona los cursos del plantel desde Cursos y Catálogos.'}
            </Text>
          </Card>
        )}

        {cursos.length > 0 && (
          <Stack gap={14}>
            {cursos.map((c, i) => (
              <CursoRow key={c.cursoId} curso={c} destacado={i === 0} />
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
