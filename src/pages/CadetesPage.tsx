import { useState } from 'react';
import { Alert, Button, Card, FileInput, Group, Loader, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import {
  ESTATUS,
  resumenImport,
  useActualizarCadete,
  useCadetes,
  useCrearCadete,
  useGrupos,
  useImportarArchivo,
  type EstatusCadete,
  type ResultadoImport,
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

function notificarResultado(r: ResultadoImport) {
  notifications.show({
    color: r.errores.length > 0 ? 'yellow' : 'green',
    message: resumenImport(r) + (r.errores.length ? `: ${r.errores.map((e) => `[${e.indice}] ${e.motivo}`).join('; ')}` : ''),
  });
}

function Importar({ grupoId }: { grupoId: string }) {
  const importarArchivo = useImportarArchivo(grupoId);
  const [archivo, setArchivo] = useState<File | null>(null);

  return (
    <Stack>
      <Text fw={600}>Importar cadetes al grupo seleccionado</Text>
      <Text size="xs" c="dimmed">
        Sube un archivo .csv o .xlsx con encabezados: matricula, nombreCompleto. Se asigna al
        grupo elegido arriba (una columna grupoId opcional lo sobreescribe). Las duplicadas y
        erróneas se reportan sin abortar las válidas (RF-CAT-07).
      </Text>

      <Group align="flex-end">
        <FileInput
          label="Archivo (.csv o .xlsx)"
          placeholder="Elige un archivo"
          accept=".csv,.xlsx"
          value={archivo}
          onChange={setArchivo}
          w={320}
          aria-label="Archivo de cadetes CSV o XLSX"
        />
        <Button
          disabled={!archivo}
          loading={importarArchivo.isPending}
          onClick={() =>
            archivo &&
            importarArchivo.mutate(archivo, {
              onSuccess: (r) => {
                setArchivo(null);
                notificarResultado(r);
              },
              onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible importar el archivo') }),
            })
          }
        >
          Importar archivo
        </Button>
      </Group>
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
    <Stack className="sga-anim-in">
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
          <Table.ScrollContainer minWidth={520}>
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
          </Table.ScrollContainer>
        </>
      )}
    </Stack>
  );
}
