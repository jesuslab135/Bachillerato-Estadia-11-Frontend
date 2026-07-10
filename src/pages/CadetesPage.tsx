import { useState } from 'react';
import { Alert, Box, Button, Card, FileInput, Group, Loader, Select, SimpleGrid, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { SectionTitle, StatusDot } from '../components/ui';
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

const COLOR_ESTATUS: Record<string, string> = {
  Activo: '#16a34a',
  BajaTemporal: '#d97706',
  BajaDefinitiva: '#dc2626',
};

function Nuevo({ grupoId }: { grupoId: string }) {
  const crear = useCrearCadete(grupoId);
  const [matricula, setMatricula] = useState('');
  const [nombre, setNombre] = useState('');
  return (
    <Stack gap="sm">
      <TextInput label="Matrícula" placeholder="3A-035" value={matricula} onChange={(e) => setMatricula(e.currentTarget.value)} />
      <TextInput label="Nombre completo" placeholder="Apellidos, Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
      <Button
        variant="light"
        fullWidth
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
    </Stack>
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
    <Stack gap="sm">
      <Text fz={13.5} c="var(--sga-text-body)">
        Sube un archivo <code>.csv</code> o <code>.xlsx</code> con encabezados <code>matricula</code>, <code>nombreCompleto</code>.
        Se asigna al grupo elegido; las duplicadas y erróneas se reportan sin abortar las válidas (RF-CAT-07).
      </Text>

      <Box style={{ border: '1.5px dashed var(--sga-input-border)', borderRadius: 11, background: 'var(--sga-surface-subtle)', padding: 18 }}>
        <Group gap="md" wrap="nowrap" align="center">
          <Box aria-hidden style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sga-primary-tint)', color: 'var(--sga-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <IconUpload size={20} />
          </Box>
          <FileInput
            placeholder="Elige un archivo .csv o .xlsx"
            accept=".csv,.xlsx"
            value={archivo}
            onChange={setArchivo}
            style={{ flex: 1 }}
            aria-label="Archivo de cadetes CSV o XLSX"
          />
        </Group>
      </Box>

      <Button
        fullWidth
        variant="light"
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
    <Stack gap={24} className="sga-anim-in">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <div>
          <Title order={1}>Cadetes</Title>
          <Text c="var(--sga-text-muted)" mt={6} fz={14}>
            Alta, estatus e importación por grupo.
          </Text>
        </div>
        <Select
          label="Grupo"
          w={240}
          placeholder="Selecciona un grupo"
          data={(grupos ?? []).map((g) => ({ value: g.id, label: `${g.nombre} (sem. ${g.semestre})` }))}
          value={grupoId}
          onChange={setGrupoId}
        />
      </Group>

      {!grupoId && <Alert color="blue">Selecciona un grupo para gestionar sus cadetes.</Alert>}

      {grupoId && (
        <>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={18}>
            <Card withBorder radius="lg" padding={22} shadow="xs">
              <SectionTitle>Nuevo cadete</SectionTitle>
              <Box mt={14}>
                <Nuevo grupoId={grupoId} />
              </Box>
            </Card>
            <Card withBorder radius="lg" padding={22} shadow="xs">
              <SectionTitle>Importar al grupo seleccionado</SectionTitle>
              <Box mt={14}>
                <Importar grupoId={grupoId} />
              </Box>
            </Card>
          </SimpleGrid>

          <Table.ScrollContainer minWidth={520}>
            <Table striped withTableBorder verticalSpacing="sm">
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
                    <Table.Td>
                      <Text size="sm" fw={500} c="var(--sga-text-strong)">
                        {c.nombreCompleto}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="JetBrains Mono" c="var(--sga-text-muted)">
                        {c.matricula}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        size="xs"
                        w={170}
                        data={ESTATUS}
                        value={c.estatus}
                        allowDeselect={false}
                        leftSection={<StatusDot color={COLOR_ESTATUS[c.estatus] ?? 'var(--sga-text-faint)'} />}
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
