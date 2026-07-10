import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, Group, Loader, NumberInput, Stack, Table, Text, Title } from '@mantine/core';
import { IconCheck, IconClock, IconDownload, IconLock, IconPencil } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { CursoContextBar } from '../components/CursoContextBar';
import { StatusPill } from '../components/ui';
import { useCursos } from '../features/asistencia';
import {
  recuperacionElegible,
  useActa,
  useCapturarRecuperacion,
  useExportarActa,
  useFirmarActa,
  type FilaActa,
} from '../features/acta';

const nota = (v: number | 'NP' | null) => (v === null ? '—' : String(v));

// Chip de firma: verde con check cuando está firmada, gris con reloj cuando pendiente.
function FirmaChip({ firmada, rol }: { firmada: boolean; rol: string }) {
  return (
    <Group
      gap={10}
      wrap="nowrap"
      style={{
        border: `1px solid ${firmada ? '#dcfce7' : 'var(--sga-border)'}`,
        background: firmada ? '#f0fdf4' : 'var(--sga-surface-subtle)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <Box
        aria-hidden
        style={{ width: 28, height: 28, borderRadius: '50%', background: firmada ? '#16a34a' : 'var(--sga-input-border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
      >
        {firmada ? <IconCheck size={16} stroke={2.5} /> : <IconClock size={16} stroke={2.2} />}
      </Box>
      <div>
        <Text fz={13} fw={600} c={firmada ? '#166534' : 'var(--sga-text)'} lh={1.2}>
          {rol}
        </Text>
        <Text fz={11.5} c={firmada ? '#16a34a' : 'var(--sga-text-faint)'} lh={1.2}>
          {firmada ? 'Firmada' : 'Pendiente'}
        </Text>
      </div>
    </Group>
  );
}

function RecuperacionCell({ cursoId, fila }: { cursoId: string; fila: FilaActa }) {
  const tipo = recuperacionElegible(fila.observacion);
  const [valor, setValor] = useState<number | string>('');
  const capturar = useCapturarRecuperacion(cursoId);
  if (!tipo)
    return (
      <Text size="sm" c="var(--sga-text-faint)">
        —
      </Text>
    );

  return (
    <Group gap="xs" wrap="nowrap">
      <NumberInput size="xs" w={80} min={0} max={10} step={0.1} value={valor} onChange={setValor} aria-label={`Nota ${tipo}`} />
      <Button
        size="xs"
        variant="light"
        disabled={valor === ''}
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
  const { data: cursos } = useCursos();
  const curso = Array.isArray(cursos) ? cursos.find((c) => c.id === cursoId) : undefined;
  const firmar = useFirmarActa(cursoId);
  const exportar = useExportarActa(cursoId);

  if (isLoading) return <Loader />;
  if (isError || !acta) return <Alert color="yellow">El acta aún no se ha generado (valida los 3 parciales).</Alert>;

  return (
    <Stack className="sga-anim-in">
      {curso && <CursoContextBar cursoId={cursoId} curso={curso} activo="acta" />}

      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div>
          <Group gap="sm" align="center">
            <Title order={2}>Acta semestral</Title>
            <StatusPill tono="neutral">v{acta.version}</StatusPill>
          </Group>
          <Text c="var(--sga-text-muted)" fz={14} mt={4}>
            Generada tras validar los 3 parciales · {acta.cadetes.length} cadete{acta.cadetes.length === 1 ? '' : 's'}
          </Text>
        </div>
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<IconPencil size={16} />}
            loading={firmar.isPending}
            onClick={() =>
              firmar.mutate(undefined, {
                onSuccess: () => notifications.show({ color: 'green', message: 'Acta firmada' }),
                onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible firmar el acta') }),
              })
            }
          >
            Firmar
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            loading={exportar.isPending}
            onClick={() =>
              exportar.mutate(undefined, {
                onSuccess: (r) => notifications.show({ color: 'green', message: `Exportada · hash ${r.hash.slice(0, 12)}…` }),
                onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible exportar el acta') }),
              })
            }
          >
            Exportar
          </Button>
        </Group>
      </Group>

      <Group gap="sm" align="center" wrap="wrap">
        <FirmaChip firmada={!!acta.firmadaDocenteEn} rol="Docente" />
        <FirmaChip firmada={!!acta.firmadaCoordinacionEn} rol="Coordinación" />
        {acta.hashPdf && (
          <Group gap={8} wrap="nowrap" style={{ border: '1px solid var(--sga-divider)', background: 'var(--sga-surface-subtle)', borderRadius: 8, padding: '9px 13px' }}>
            <IconLock size={14} color="var(--sga-text-faint)" />
            <Text fz={12} c="var(--sga-text-faint)" ff="JetBrains Mono">
              hash {acta.hashPdf.slice(0, 16)}…
            </Text>
          </Group>
        )}
      </Group>

      <Table.ScrollContainer minWidth={620}>
        <Table striped withTableBorder verticalSpacing="sm">
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
                  <Text size="sm" fw={500} c="var(--sga-text-strong)">
                    {f.nombreCompleto}
                  </Text>
                  <Text size="xs" c="var(--sga-text-faint)" ff="JetBrains Mono">
                    {f.matricula}
                  </Text>
                </Table.Td>
                <Table.Td>{f.parciales.map(nota).join(' · ')}</Table.Td>
                <Table.Td>{f.observacion ? <StatusPill tono="warning">{f.observacion}</StatusPill> : '—'}</Table.Td>
                <Table.Td>
                  <RecuperacionCell cursoId={cursoId} fila={f} />
                </Table.Td>
                <Table.Td>
                  <Text ff="Archivo" fw={700} fz={15} c="var(--sga-text-strong)">
                    {f.calificacionFinal}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
