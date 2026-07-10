import type { ReactNode } from 'react';
import { Box, Text } from '@mantine/core';
import { IconCheck, IconLock } from '@tabler/icons-react';

// Tile del logo para el panel de marca (gradiente navy + borde dorado + estrella).
function BrandLogo() {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Box
        aria-hidden
        className="sga-logo-tile"
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(11,30,64,.45), inset 0 1px 0 rgba(255,255,255,.09)',
          flex: 'none',
        }}
      >
        <span style={{ color: 'var(--sga-gold)', fontSize: 13, lineHeight: 1 }}>★</span>
        <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '.03em' }}>SGA</span>
      </Box>
      <div>
        <Text c="#fff" ff="Archivo" fw={700} fz={16} lh={1.1} style={{ letterSpacing: '-0.02em' }}>
          SGA-Militar
        </Text>
        <Text fz={10.5} c="#93c5fd" mt={3} style={{ letterSpacing: '.16em', fontWeight: 600 }}>
          BACHILLERATO MILITARIZADO
        </Text>
      </div>
    </Box>
  );
}

// Panel de marca navy (izquierda del split de acceso — login 1a / cambiar contraseña 2g).
function BrandPanel({ headline, parrafo, features }: { headline: ReactNode; parrafo: string; features: string[] }) {
  return (
    <Box
      className="sga-navy-panel"
      visibleFrom="md"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 44px', position: 'relative', overflow: 'hidden' }}
    >
      <BrandLogo />

      <Box maw={300}>
        <Box style={{ width: 34, height: 3, borderRadius: 2, background: 'var(--sga-gold)', marginBottom: 20 }} />
        <Text c="#fff" ff="Archivo" fw={700} fz={31} lh={1.16} style={{ letterSpacing: '-0.02em' }}>
          {headline}
        </Text>
        <Text c="#b6cdf0" fz={14.5} lh={1.6} mt={16}>
          {parrafo}
        </Text>
      </Box>

      <Box>
        {features.map((f) => (
          <Box key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Box
              aria-hidden
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '1px solid var(--sga-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <IconCheck size={12} color="var(--sga-gold)" stroke={2.5} />
            </Box>
            <Text c="#cdddf5" fz={13}>
              {f}
            </Text>
          </Box>
        ))}
        <Box style={{ borderTop: '1px solid rgba(147,197,253,.14)', marginTop: 18, paddingTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconLock size={13} color="#7ea6dd" aria-hidden />
          <Text fz={11.5} c="#7ea6dd">
            Conexión cifrada · Uso interno
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Layout de acceso en split (1a): panel de marca navy a la izquierda (oculto en móvil)
 * y contenido del formulario a la derecha, centrado. Reutilizado por login y cambio de
 * contraseña para mantener la misma familia visual.
 */
export function AuthLayout({
  headline,
  parrafo,
  features,
  eyebrow,
  children,
}: {
  headline: ReactNode;
  parrafo: string;
  features: string[];
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <Box className="sga-dot-canvas" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Box
        className="sga-anim-in"
        style={{
          width: '100%',
          maxWidth: 980,
          minHeight: 600,
          display: 'grid',
          background: '#fff',
          border: '1px solid var(--sga-frame-border)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'var(--sga-shadow-frame)',
        }}
        data-auth-split
      >
        <BrandPanel headline={headline} parrafo={parrafo} features={features} />
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
          <Box style={{ width: '100%', maxWidth: 340 }}>
            <Text fz={11.5} fw={600} c="var(--sga-text-faint)" mb={10} style={{ letterSpacing: '.18em' }}>
              {eyebrow}
            </Text>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
