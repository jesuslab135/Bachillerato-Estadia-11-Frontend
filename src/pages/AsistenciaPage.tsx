import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Button, Group, Loader, SegmentedControl, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import {
  CODIGOS,
  type Codigo,
  useAsistenciaFecha,
  useCapturarAsistencia,
  useCursos,
  useResumen,
  useRoster,
} from '../features/asistencia';

const hoyISO = () => new Date().toISOString().slice(0, 10);

export function AsistenciaPage() {
  const { cursoId = '' } = useParams();
  const [fecha, setFecha] = useState(hoyISO());
  const [parcial, setParcial] = useState('1');
  const [codigos, setCodigos] = useState<Record<string, Codigo>>({});

  const { data: cursos } = useCursos();
  const curso = cursos?.find((c) => c.id === cursoId);
  const { data: roster, isLoading } = useRoster(curso?.grupo.id);
  const { data: asistencia } = useAsistenciaFecha(cursoId, fecha);
  const { data: resumen } = useResumen(cursoId, Number(parcial));
  const capturar = useCapturarAsistencia(cursoId);

  useEffect(() => {
    if (!roster) return;
    const existentes = new Map((asistencia ?? []).map((a) => [a.cadeteMatricula, a.codigo]));
    setCodigos(Object.fromEntries(roster.map((c) => [c.matricula, existentes.get(c.matricula) ?? 'A'])));
  }, [roster, asistencia]);

  const sdePorCadete = useMemo(() => new Map((resumen?.cadetes ?? []).map((f) => [f.matricula, f])), [resumen]);

  if (isLoading) return <Loader />;
  if (!curso) return <Alert color="red">Curso no encontrado.</Alert>;

  const guardar = () => {
    const registros = (roster ?? [])
      .filter((c) => c.estatus !== 'BajaDefinitiva')
      .map((c) => ({ cadeteMatricula: c.matricula, codigo: codigos[c.matricula] ?? ('A' as Codigo) }));
    capturar.mutate(
      { fecha, registros },
      {
        onSuccess: (r) =>
          notifications.show({
            color: r.offline ? 'yellow' : 'green',
            message: r.offline ? 'Sin conexión: guardado local, se sincronizará al reconectar.' : 'Asistencia guardada.',
          }),
        onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar la asistencia') }),
      },
    );
  };

  return (
    <Stack>
      <Title order={3}>
        Asistencia · {curso.materia.clave} — {curso.grupo.nombre}
      </Title>

      <Group align="flex-end">
        <TextInput type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.currentTarget.value)} />
        <div>
          <Text size="sm" fw={500} mb={4}>
            Parcial (para SDE)
          </Text>
          <SegmentedControl value={parcial} onChange={setParcial} data={['1', '2', '3']} />
        </div>
        <Button onClick={guardar} loading={capturar.isPending} ml="auto">
          Guardar asistencia
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Cadete</Table.Th>
            <Table.Th>Código</Table.Th>
            <Table.Th>Faltas / %</Table.Th>
            <Table.Th>Estatus</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(roster ?? []).map((c) => {
            const resumenFila = sdePorCadete.get(c.matricula);
            const bajaDef = c.estatus === 'BajaDefinitiva';
            return (
              <Table.Tr key={c.matricula} bg={bajaDef ? 'var(--mantine-color-red-0)' : resumenFila?.sde ? 'var(--mantine-color-orange-0)' : undefined}>
                <Table.Td>
                  <Text size="sm">{c.nombreCompleto}</Text>
                  <Text size="xs" c="dimmed">
                    {c.matricula}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <SegmentedControl
                    size="xs"
                    disabled={bajaDef}
                    aria-label={`Código de asistencia ${c.nombreCompleto}`}
                    value={codigos[c.matricula] ?? 'A'}
                    onChange={(v) => setCodigos((prev) => ({ ...prev, [c.matricula]: v as Codigo }))}
                    data={CODIGOS.map((cod) => ({ label: cod, value: cod }))}
                  />
                </Table.Td>
                <Table.Td>
                  {resumenFila ? (
                    <Text size="sm">
                      {resumenFila.faltas} · {Math.round(resumenFila.porcentajeAsistencia * 100)}%
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed">
                      —
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {bajaDef && <Badge color="red">Baja definitiva</Badge>}
                  {!bajaDef && resumenFila?.sde && <Badge color="orange">SDE</Badge>}
                  {!bajaDef && resumenFila && !resumenFila.sde && <Badge color="green" variant="light">Con derecho</Badge>}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
