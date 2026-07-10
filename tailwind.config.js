import animate from 'tailwindcss-animate';

// Tailwind junto a Mantine. preflight:false para NO resetear los estilos de Mantine.
// Paleta espejo del sistema de diseño (ver src/theme.ts y src/global.css).
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Azul institucional (#1d4ed8 = brand-700, tono principal).
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Superficie institucional navy + acento ceremonial dorado (escaso).
        navy: { DEFAULT: '#0b1e40', deep: '#0a1730', logo: '#1c4a86' },
        gold: '#e2c07a',
        // Neutrales y bordes propios del canvas.
        frameborder: '#dbe1ea',
        divider: '#eef1f5',
        zebra: '#fbfcfe',
        canvas: '#e7ebf1',
        // Sets semánticos (badges, filas, chips de estado).
        success: { DEFAULT: '#16a34a', dark: '#166534', bg: '#dcfce7' },
        warn: { DEFAULT: '#b45309', dot: '#d97706', bg: '#fef3c7', row: '#fff7ed' },
        danger: { DEFAULT: '#b91c1c', dot: '#dc2626', bg: '#fee2e2', row: '#fef2f2', border: '#fecaca' },
      },
      fontFamily: {
        display: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        frame: '0 1px 2px rgba(15,23,42,.04), 0 24px 60px -22px rgba(15,23,42,.28)',
        rest: '0 1px 2px rgba(15,23,42,.04)',
        hoverblue: '0 12px 28px -16px rgba(29,78,216,.28)',
        btnblue: '0 6px 16px -6px rgba(29,78,216,.6)',
      },
    },
  },
  plugins: [animate],
};
