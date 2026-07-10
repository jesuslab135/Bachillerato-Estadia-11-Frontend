import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconLock, IconMail } from '@tabler/icons-react';
import { useAuth } from '../auth/AuthContext';
import { mensajeError } from '../api/errores';
import { AuthLayout } from '../components/AuthLayout';

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
    <AuthLayout
      eyebrow="ACCESO AL SISTEMA"
      headline={
        <>
          Disciplina, orden y<br />
          excelencia académica.
        </>
      }
      parrafo="Plataforma interna de gestión académica. Acceso exclusivo para personal autorizado."
      features={['Asistencia, calificaciones y actas en un solo lugar', 'Sincroniza sin conexión y protege cada registro']}
    >
      <Title order={3} fz={27} mb={4}>
        Iniciar sesión
      </Title>
      <Text c="var(--sga-text-muted)" fz={14} mb="lg">
        Ingresa con tu correo institucional.
      </Text>
      <form onSubmit={enviar}>
        <Stack gap="md">
          <TextInput
            label="Correo institucional"
            placeholder="usuario@sga.local"
            leftSection={<IconMail size={17} />}
            {...form.getInputProps('email')}
          />
          <PasswordInput label="Contraseña" leftSection={<IconLock size={17} />} {...form.getInputProps('password')} />
          {error && (
            <div role="alert" style={{ color: 'var(--mantine-color-red-6)', fontSize: 13.5 }}>
              {error}
            </div>
          )}
          <Button type="submit" loading={cargando} fullWidth size="md" rightSection={<IconArrowRight size={17} />}>
            Entrar
          </Button>
        </Stack>
      </form>
      <Text ta="center" fz={12.5} c="var(--sga-text-faint)" mt="lg">
        ¿Problemas para acceder? Contacta a <Anchor href="mailto:coordinacion@sga.local" fz={12.5}>Coordinación Académica</Anchor>.
      </Text>
    </AuthLayout>
  );
}
