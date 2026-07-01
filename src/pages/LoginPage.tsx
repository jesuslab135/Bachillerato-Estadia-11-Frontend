import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../auth/AuthContext';
import { mensajeError } from '../api/errores';

export function LoginPage() {
  const { ingresar } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Correo inválido'),
      password: (v) => (v.length > 0 ? null : 'Requerido'),
    },
  });

  const enviar = form.onSubmit(async ({ email, password }) => {
    setError(null);
    setCargando(true);
    try {
      const sesion = await ingresar(email, password);
      navigate(sesion.debeCambiar ? '/cambiar-contrasena' : '/', { replace: true });
    } catch (e) {
      setError(mensajeError(e, 'No fue posible iniciar sesión'));
    } finally {
      setCargando(false);
    }
  });

  return (
    <Container size={420} my={80}>
      <Title order={2} ta="center" mb="lg">
        SGA-Militar
      </Title>
      <Paper withBorder shadow="sm" p="xl" radius="md" className="sga-anim-in">
        <form onSubmit={enviar}>
          <Stack>
            <TextInput label="Correo" placeholder="usuario@sga.local" {...form.getInputProps('email')} />
            <PasswordInput label="Contraseña" {...form.getInputProps('password')} />
            {error && (
              <div role="alert" style={{ color: 'var(--mantine-color-red-6)' }}>
                {error}
              </div>
            )}
            <Button type="submit" loading={cargando} fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
