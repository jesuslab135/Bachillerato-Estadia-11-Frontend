import type { ReactNode } from 'react';
import { Box, Card, Text } from '@mantine/core';

// Primitivas del sistema de diseño (rediseño 2026-07). Reutilizadas por las pantallas de
// características para mantener badges, paneles y encabezados consistentes con el canvas.

export type Tono = 'success' | 'warning' | 'danger' | 'neutral' | 'blue' | 'teal';

const TONO: Record<Tono, { fg: string; bg: string }> = {
  success: { fg: '#16a34a', bg: '#dcfce7' },
  warning: { fg: '#b45309', bg: '#fef3c7' },
  danger: { fg: '#b91c1c', bg: '#fee2e2' },
  neutral: { fg: '#475569', bg: '#f1f5f9' },
  blue: { fg: '#1d4ed8', bg: '#eff6ff' },
  teal: { fg: '#0f766e', bg: '#ccfbf1' },
};

/** Chip de estado (badge pill). El color se deriva del enum de dominio, no del backend. */
export function StatusPill({ tono, children }: { tono: Tono; children: ReactNode }) {
  const t = TONO[tono];
  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        borderRadius: 999,
        padding: '4px 11px',
        color: t.fg,
        background: t.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

/** Punto de estado (7px) para selects/leyendas. */
export function StatusDot({ color }: { color: string }) {
  return <Box aria-hidden component="span" style={{ width: 7, height: 7, borderRadius: '50%', background: color, flex: 'none' }} />;
}

/** Avatar de curso: tile con la clave de la materia; el destacado usa el gradiente navy. */
export function CourseAvatar({ code, destacado = false, size = 56 }: { code: string; destacado?: boolean; size?: number }) {
  return (
    <Box
      aria-hidden
      className={destacado ? 'sga-logo-tile' : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: destacado ? undefined : 'var(--sga-chip)',
        color: destacado ? '#fff' : 'var(--sga-text)',
        fontFamily: 'Archivo',
        fontWeight: 700,
        fontSize: size <= 46 ? 13 : 14,
      }}
    >
      {code}
    </Box>
  );
}

/** Panel/tarjeta de contenido con el estilo de reposo del sistema. */
export function Panel({ children, ...rest }: { children: ReactNode } & Record<string, unknown>) {
  return (
    <Card withBorder radius="lg" padding={22} shadow="xs" {...rest}>
      {children}
    </Card>
  );
}

/** Título de sección con la display face (Archivo). */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text ff="Archivo" fw={600} fz={16} c="var(--sga-text-strong)" style={{ letterSpacing: '-0.01em' }}>
      {children}
    </Text>
  );
}
