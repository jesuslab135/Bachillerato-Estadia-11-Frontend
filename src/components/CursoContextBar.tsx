import { Anchor, Box, Group, Text } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

type Tab = 'asistencia' | 'parciales' | 'calificaciones' | 'acta';

interface CursoLike {
  id?: string;
  materia: { clave: string; nombre: string };
  grupo: { nombre: string };
  periodo?: { codigo: string };
}

const TABS: { key: Tab; etiqueta: string }[] = [
  { key: 'asistencia', etiqueta: 'Asistencia' },
  { key: 'parciales', etiqueta: 'Parciales' },
  { key: 'calificaciones', etiqueta: 'Calificaciones' },
  { key: 'acta', etiqueta: 'Acta' },
];

/**
 * Barra de contexto del curso (sub-header de las pantallas de curso): back a Cursos,
 * identidad del curso y pestañas Asistencia/Parciales/Calificaciones/Acta. Se despliega
 * a lo ancho del contenedor (bleed sobre el padding lateral de 28px del AppShell).
 */
export function CursoContextBar({ cursoId, curso, activo }: { cursoId: string; curso: CursoLike; activo: Tab }) {
  const meta = [curso.materia.clave, curso.periodo?.codigo, curso.grupo.nombre].filter(Boolean).join(' · ');
  return (
    <Box
      style={{
        margin: '-40px -28px 8px',
        padding: '15px 28px',
        background: 'var(--sga-zebra)',
        borderBottom: '1px solid var(--sga-divider)',
      }}
    >
      <Group justify="space-between" wrap="wrap" gap="md">
        <Group gap={14} wrap="nowrap" style={{ minWidth: 0 }}>
          <Anchor component={Link} to="/cursos" underline="never" c="var(--sga-text-muted)" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            <IconChevronLeft size={15} />
            Cursos
          </Anchor>
          <Box aria-hidden style={{ width: 1, height: 30, background: 'var(--sga-border)' }} />
          <Box style={{ minWidth: 0 }}>
            <Text ff="Archivo" fw={600} fz={16} c="var(--sga-text-strong)" truncate>
              {curso.materia.nombre}
            </Text>
            <Text fz={12} c="var(--sga-text-faint)" truncate>
              {meta}
            </Text>
          </Box>
        </Group>
        <Group gap={4} wrap="wrap">
          {TABS.map((t) => {
            const es = t.key === activo;
            return (
              <Anchor
                key={t.key}
                component={Link}
                to={`/cursos/${cursoId}/${t.key}`}
                underline="never"
                className="sga-nav-pill"
                data-activo={es || undefined}
                style={{
                  padding: '7px 13px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: es ? 600 : 500,
                  color: es ? 'var(--sga-primary)' : 'var(--sga-text-body)',
                  background: es ? 'var(--sga-primary-tint)' : 'transparent',
                }}
              >
                {t.etiqueta}
              </Anchor>
            );
          })}
        </Group>
      </Group>
    </Box>
  );
}
