import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Paper, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { api } from '../api/client';
import { mensajeError } from '../api/errores';
import { useAuth } from '../auth/AuthContext';

export function CambiarContrasenaPage() {
  const { sesion, refrescar } = useAuth();
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
    <Container size={420} my={80}>
      <Title order={2} ta="center" mb="sm">
        Cambiar contraseña
      </Title>
      {sesion?.debeCambiar && (
        <Text c="dimmed" ta="center" mb="lg" size="sm">
          Es tu primer ingreso: define una contraseña nueva para continuar.
        </Text>
      )}
      <Paper withBorder shadow="sm" p="xl" radius="md" className="sga-anim-in">
        <form onSubmit={enviar}>
          <Stack>
            <PasswordInput label="Contraseña actual" {...form.getInputProps('actual')} />
            <PasswordInput label="Nueva contraseña" {...form.getInputProps('nueva')} />
            <PasswordInput label="Confirmar nueva" {...form.getInputProps('confirmar')} />
            {error && (
              <div role="alert" style={{ color: 'var(--mantine-color-red-6)' }}>
                {error}
              </div>
            )}
            <Button type="submit" loading={cargando} fullWidth>
              Guardar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
