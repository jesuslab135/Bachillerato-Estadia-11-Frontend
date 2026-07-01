import { createTheme, type MantineColorsTuple } from '@mantine/core';

// FB-F-4 — Azul institucional (#1d4ed8) como primario + neutrales SLATE.
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
    fontFamily: FUENTE,
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '48px', lineHeight: '1.1', fontWeight: '600' },
      h2: { fontSize: '36px', lineHeight: '1.15', fontWeight: '600' },
      h3: { fontSize: '28px', lineHeight: '1.2', fontWeight: '600' },
      h4: { fontSize: '22px', lineHeight: '1.3', fontWeight: '600' },
      h5: { fontSize: '18px', lineHeight: '1.4', fontWeight: '600' },
      h6: { fontSize: '16px', lineHeight: '1.4', fontWeight: '600' },
    },
  },

  defaultRadius: 'md',
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },

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
  },
});
