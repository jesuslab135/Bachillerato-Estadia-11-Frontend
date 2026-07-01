import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Button, Group, Loader, NumberInput, Stack, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import {
  recuperacionElegible,
  useActa,
  useCapturarRecuperacion,
  useExportarActa,
  useFirmarActa,
  type FilaActa,
} from '../features/acta';

const nota = (v: number | 'NP' | null) => (v === null ? '—' : String(v));

function RecuperacionCell({ cursoId, fila }: { cursoId: string; fila: FilaActa }) {
  const tipo = recuperacionElegible(fila.observacion);
  const [valor, setValor] = useState<number | string>('');
  const capturar = useCapturarRecuperacion(cursoId);
  if (!tipo) return <Text size="sm" c="dimmed">—</Text>;

  return (
    <Group gap="xs" wrap="nowrap">
      <NumberInput size="xs" w={80} min={0} max={10} step={0.1} value={valor} onChange={setValor} aria-label={`Nota ${tipo}`} />
      <Button
        size="xs"
        variant="light"
        loading={capturar.isPending}
        onClick={() =>
          capturar.mutate(
            { cadeteMatricula: fila.matricula, tipo, valor: Number(valor) },
            {
              onSuccess: () => notifications.show({ color: 'green', message: `${tipo} registrado` }),
              onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible registrar') }),
            },
          )
        }
      >
        {tipo}
      </Button>
    </Group>
  );
}

export function ActaPage() {
  const { cursoId = '' } = useParams();
  const { data: acta, isLoading, isError } = useActa(cursoId);
  const firmar = useFirmarActa(cursoId);
  const exportar = useExportarActa(cursoId);

  if (isLoading) return <Loader />;
  if (isError || !acta) return <Alert color="yellow">El acta aún no se ha generado (valida los 3 parciales).</Alert>;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Acta semestral · v{acta.version}</Title>
        <Group>
          <Button variant="light" loading={firmar.isPending} onClick={() => firmar.mutate()}>
            Firmar
          </Button>
          <Button
            variant="light"
            loading={exportar.isPending}
            onClick={() =>
              exportar.mutate(undefined, {
                onSuccess: (r) => notifications.show({ color: 'green', message: `Exportada · hash ${r.hash.slice(0, 12)}…` }),
              })
            }
          >
            Exportar
          </Button>
        </Group>
      </Group>

      <Group gap="xs">
        <Badge color={acta.firmadaDocenteEn ? 'green' : 'gray'}>Docente {acta.firmadaDocenteEn ? '✓' : 'pendiente'}</Badge>
        <Badge color={acta.firmadaCoordinacionEn ? 'green' : 'gray'}>Coordinación {acta.firmadaCoordinacionEn ? '✓' : 'pendiente'}</Badge>
        {acta.hashPdf && (
          <Text size="xs" c="dimmed">
            hash {acta.hashPdf.slice(0, 16)}…
          </Text>
        )}
      </Group>

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Cadete</Table.Th>
            <Table.Th>P1 · P2 · P3</Table.Th>
            <Table.Th>Observación</Table.Th>
            <Table.Th>Recuperación</Table.Th>
            <Table.Th>Final</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {acta.cadetes.map((f) => (
            <Table.Tr key={f.matricula}>
              <Table.Td>
                <Text size="sm">{f.nombreCompleto}</Text>
                <Text size="xs" c="dimmed">
                  {f.matricula}
                </Text>
              </Table.Td>
              <Table.Td>{f.parciales.map(nota).join(' · ')}</Table.Td>
              <Table.Td>{f.observacion ? <Badge color="orange" variant="light">{f.observacion}</Badge> : '—'}</Table.Td>
              <Table.Td>
                <RecuperacionCell cursoId={cursoId} fila={f} />
              </Table.Td>
              <Table.Td>
                <Text fw={600}>{f.calificacionFinal}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
