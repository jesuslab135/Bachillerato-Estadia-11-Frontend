import { useState } from 'react';
import { Alert, Button, Card, Group, Loader, Select, Stack, Table, Text, Textarea, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import {
  ESTATUS,
  resumenImport,
  useActualizarCadete,
  useCadetes,
  useCrearCadete,
  useGrupos,
  useImportarCadetes,
  type EstatusCadete,
} from '../features/cadetes';

function Nuevo({ grupoId }: { grupoId: string }) {
  const crear = useCrearCadete(grupoId);
  const [matricula, setMatricula] = useState('');
  const [nombre, setNombre] = useState('');
  return (
    <Group align="flex-end">
      <TextInput label="Matrícula" value={matricula} onChange={(e) => setMatricula(e.currentTarget.value)} />
      <TextInput label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
      <Button
        variant="light"
        disabled={!matricula.trim() || !nombre.trim()}
        loading={crear.isPending}
        onClick={() =>
          crear.mutate(
            { matricula: matricula.trim(), nombreCompleto: nombre.trim() },
            {
              onSuccess: () => {
                setMatricula('');
                setNombre('');
                notifications.show({ color: 'green', message: 'Cadete creado' });
              },
              onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible crear el cadete') }),
            },
          )
        }
      >
        Agregar cadete
      </Button>
    </Group>
  );
}

function Importar({ grupoId }: { grupoId: string }) {
  const importar = useImportarCadetes(grupoId);
  const [csv, setCsv] = useState(`matricula,nombreCompleto,grupoId\nMAT-001,Nombre Apellido,${grupoId}`);
  return (
    <Stack>
      <Text fw={600}>Importar CSV</Text>
      <Text size="xs" c="dimmed">
        Encabezados: matricula, nombreCompleto, grupoId. Las duplicadas y erróneas se reportan sin abortar las válidas (RF-CAT-07).
      </Text>
      <Textarea autosize minRows={3} value={csv} onChange={(e) => setCsv(e.currentTarget.value)} />
      <Button
        variant="light"
        loading={importar.isPending}
        onClick={() =>
          importar.mutate(csv, {
            onSuccess: (r) =>
              notifications.show({
                color: r.errores.length > 0 ? 'yellow' : 'green',
                message: resumenImport(r) + (r.errores.length ? `: ${r.errores.map((e) => `[${e.indice}] ${e.motivo}`).join('; ')}` : ''),
              }),
            onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible importar') }),
          })
        }
      >
        Importar
      </Button>
    </Stack>
  );
}

export function CadetesPage() {
  const { data: grupos, isLoading } = useGrupos();
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const { data: cadetes } = useCadetes(grupoId);
  const actualizar = useActualizarCadete(grupoId);

  if (isLoading) return <Loader />;

  return (
    <Stack>
      <Title order={3}>Cadetes</Title>
      <Select
        label="Grupo"
        w={280}
        placeholder="Selecciona un grupo"
        data={(grupos ?? []).map((g) => ({ value: g.id, label: `${g.nombre} (sem. ${g.semestre})` }))}
        value={grupoId}
        onChange={setGrupoId}
      />

      {!grupoId && <Alert color="blue">Selecciona un grupo para gestionar sus cadetes.</Alert>}

      {grupoId && (
        <>
          <Card withBorder radius="md">
            <Nuevo grupoId={grupoId} />
          </Card>
          <Card withBorder radius="md">
            <Importar grupoId={grupoId} />
          </Card>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cadete</Table.Th>
                <Table.Th>Matrícula</Table.Th>
                <Table.Th>Estatus</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(cadetes ?? []).map((c) => (
                <Table.Tr key={c.matricula}>
                  <Table.Td>{c.nombreCompleto}</Table.Td>
                  <Table.Td>{c.matricula}</Table.Td>
                  <Table.Td>
                    <Select
                      size="xs"
                      w={160}
                      data={ESTATUS}
                      value={c.estatus}
                      allowDeselect={false}
                      onChange={(v) =>
                        v &&
                        actualizar.mutate(
                          { matricula: c.matricula, estatus: v as EstatusCadete },
                          {
                            onSuccess: () => notifications.show({ color: 'green', message: 'Estatus actualizado' }),
                            onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible actualizar') }),
                          },
                        )
                      }
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Stack>
  );
}
