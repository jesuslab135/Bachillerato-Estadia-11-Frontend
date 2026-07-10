import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Group, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconLock } from '@tabler/icons-react';
import { api } from '../api/client';
import { mensajeError } from '../api/errores';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

// Fuerza de la contraseña: longitud + dígito + variedad de caracteres (0..3).
export function fuerzaContrasena(v: string): { nivel: 0 | 1 | 2 | 3; etiqueta: string } {
  let n = 0;
  if (v.length >= 8) n++;
  if (/\d/.test(v)) n++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) n++;
  else if (/[^A-Za-z0-9]/.test(v)) n++;
  const nivel = Math.min(n, 3) as 0 | 1 | 2 | 3;
  const etiqueta = v.length === 0 ? '' : nivel <= 1 ? 'Débil' : nivel === 2 ? 'Aceptable' : 'Fuerte';
  return { nivel, etiqueta };
}

function MedidorFuerza({ valor }: { valor: string }) {
  const { nivel, etiqueta } = fuerzaContrasena(valor);
  return (
    <Box>
      <Group gap={6} grow>
        {[0, 1, 2].map((i) => (
          <Box key={i} style={{ height: 4, borderRadius: 999, background: i < nivel ? 'var(--sga-primary)' : 'var(--sga-border)' }} />
        ))}
      </Group>
      {etiqueta && (
        <Text fz={11.5} c="var(--sga-text-muted)" mt={5}>
          {etiqueta}
        </Text>
      )}
    </Box>
  );
}

export function CambiarContrasenaPage() {
  const { refrescar } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const form = useForm({
    initialValues: { actual: '', nueva: '', confirmar: '' },
    validate: {
      actual: (v) => (v.length > 0 ? null : 'Captura tu contraseña actual'),
      nueva: (v) => (v.length >= 8 ? null : 'Mínimo 8 caracteres'),
      confirmar: (v, values) => (v === values.nueva ? null : 'No coincide'),
    },
  });

  const enviar = form.onSubmit(async ({ actual, nueva }) => {
    setError(null);
    setCargando(true);
    try {
      const { data } = await api.post<{ accessToken: string }>('/api/auth/change-password', { actual, nueva });
      refrescar(data.accessToken);
      navigate('/', { replace: true });
    } catch (e) {
      setError(mensajeError(e, 'No fue posible cambiar la contraseña'));
    } finally {
      setCargando(false);
    }
  });

  return (
    <AuthLayout
      eyebrow="PRIMER INGRESO"
      headline={<>Protege tu cuenta.</>}
      parrafo="Por seguridad, en tu primer ingreso debes crear una contraseña personal."
      features={['Mínimo 8 caracteres', 'No la compartas con nadie']}
    >
      <Title order={3} fz={26} mb={4}>
        Cambiar contraseña
      </Title>
      <Text c="var(--sga-text-muted)" fz={14} mb="lg">
        Define una contraseña nueva para continuar.
      </Text>
      <form onSubmit={enviar}>
        <Stack gap="md">
          <PasswordInput label="Contraseña actual" leftSection={<IconLock size={17} />} {...form.getInputProps('actual')} />
          <div>
            <PasswordInput label="Nueva contraseña" leftSection={<IconLock size={17} />} {...form.getInputProps('nueva')} />
            {form.values.nueva.length > 0 && (
              <Box mt={8}>
                <MedidorFuerza valor={form.values.nueva} />
              </Box>
            )}
          </div>
          <PasswordInput label="Confirmar nueva" leftSection={<IconLock size={17} />} {...form.getInputProps('confirmar')} />
          {error && (
            <div role="alert" style={{ color: 'var(--mantine-color-red-6)', fontSize: 13.5 }}>
              {error}
            </div>
          )}
          <Button type="submit" loading={cargando} fullWidth size="md" rightSection={<IconArrowRight size={17} />}>
            Guardar y continuar
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
