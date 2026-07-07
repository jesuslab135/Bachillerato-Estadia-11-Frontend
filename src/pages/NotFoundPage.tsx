import { Anchor, Container, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

// FB-F-14: 404 honesta en lugar de redirigir a "/" en silencio.
export function NotFoundPage() {
  return (
    <Container size={480} my={80}>
      <Stack align="center" className="sga-anim-in">
        <Title order={2}>Página no encontrada</Title>
        <Text c="dimmed" ta="center">
          La dirección que intentas abrir no existe o fue movida.
        </Text>
        <Anchor component={Link} to="/">
          Volver a Inicio
        </Anchor>
      </Stack>
    </Container>
  );
}
