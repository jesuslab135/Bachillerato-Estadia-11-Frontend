import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Rediseño 2026-07 — Azul institucional (#1d4ed8) primario + neutrales SLATE.
// Escala Tailwind "blue"; el shade 7 (#1d4ed8) es el tono filled → CTAs azules llamativos.
const brand: MantineColorsTuple = [
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#93c5fd',
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1d4ed8', // shade 7 → botones filled / CTA (azul institucional)
  '#1e40af',
  '#1e3a8a',
];

const slate: MantineColorsTuple = [
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
];

// Fuentes del rediseño: Archivo para la display face (títulos, números, logo) e Inter para UI/cuerpo.
const DISPLAY = 'Archivo, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const FUENTE = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 7, dark: 7 }, // brand[7] = #1d4ed8
  colors: { brand, slate, gray: slate, dark: slate },
  white: '#ffffff',
  black: '#0f172a', // texto/titulares (slate-900)

  fontFamily: FUENTE,
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',

  headings: {
    fontFamily: DISPLAY,
    fontWeight: '700',
    sizes: {
      // Escala alineada al canvas: títulos de página 32px (Archivo 700), tracking negativo suave.
      h1: { fontSize: '32px', lineHeight: '1.1', fontWeight: '700' },
      h2: { fontSize: '26px', lineHeight: '1.15', fontWeight: '700' },
      h3: { fontSize: '20px', lineHeight: '1.2', fontWeight: '700' },
      h4: { fontSize: '18px', lineHeight: '1.3', fontWeight: '600' },
      h5: { fontSize: '16px', lineHeight: '1.4', fontWeight: '600' },
      h6: { fontSize: '14px', lineHeight: '1.4', fontWeight: '600' },
    },
  },

  // Radios del canvas: inputs/botones ~9px (md), tarjetas 14px (lg), badges pill (xl).
  defaultRadius: 'md',
  radius: { xs: '5px', sm: '7px', md: '9px', lg: '14px', xl: '16px' },

  // Sombras del sistema: reposo sutil, hover azulado, marco (elevación dramática) y modal.
  shadows: {
    xs: '0 1px 2px rgba(15,23,42,.04)',
    sm: '0 1px 2px rgba(15,23,42,.04)',
    md: '0 12px 28px -16px rgba(29,78,216,.28)',
    lg: '0 24px 60px -22px rgba(15,23,42,.28)',
    xl: '0 30px 60px -20px rgba(3,10,26,.65)',
  },

  components: {
    Button: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'lg' } },
    Paper: { defaultProps: { radius: 'lg' } },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    NumberInput: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
    Badge: { defaultProps: { radius: 'xl' } },
    Table: { defaultProps: {} },
  },
});
