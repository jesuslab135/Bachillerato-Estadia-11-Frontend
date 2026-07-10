import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, Group, Loader, SegmentedControl, Stack, Table, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CursoContextBar } from '../components/CursoContextBar';
import { StatusPill } from '../components/ui';
import { mensajeError } from '../api/errores';
import { hoyLocalISO } from '../lib/fechas';
import { MENSAJE_DIRTY, useDirtyGuard } from '../lib/useDirtyGuard';
import {
  CODIGOS,
  type Codigo,
  useAsistenciaFecha,
  useCapturarAsistencia,
  useCursos,
  useResumen,
  useRoster,
} from '../features/asistencia';

export function AsistenciaPage() {
  const { cursoId = '' } = useParams();
  const [fecha, setFecha] = useState(hoyLocalISO());
  const [parcial, setParcial] = useState('1');
  const [codigos, setCodigos] = useState<Record<string, Codigo>>({});
  const [dirty, setDirty] = useState(false);
  const celdasDirty = useRef(new Set<string>());
  const claveInit = useRef('');

  const { data: cursos, isLoading: cargandoCursos, isError: errorCursos } = useCursos();
  const curso = cursos?.find((c) => c.id === cursoId);
  const { data: roster, isLoading } = useRoster(curso?.grupo.id);
  const { data: asistencia } = useAsistenciaFecha(cursoId, fecha);
  const { data: resumen } = useResumen(cursoId, Number(parcial));
  const capturar = useCapturarAsistencia(cursoId);

  useDirtyGuard(dirty);

  // FB-F-13: init keyed por (curso, fecha). Un refetch con la misma clave solo actualiza las
  // celdas no tocadas por el usuario; lo tecleado sin guardar nunca se pisa.
  useEffect(() => {
    if (!roster) return;
    const clave = `${cursoId}|${fecha}`;
    const existentes = new Map((asistencia ?? []).map((a) => [a.cadeteMatricula, a.codigo]));
    const base = Object.fromEntries(roster.map((c) => [c.matricula, existentes.get(c.matricula) ?? ('A' as Codigo)]));
    if (claveInit.current !== clave) {
      claveInit.current = clave;
      celdasDirty.current.clear();
      setDirty(false);
      setCodigos(base);
      return;
    }
    setCodigos((prev) => {
      const siguiente = { ...base };
      for (const m of celdasDirty.current) if (m in prev) siguiente[m] = prev[m];
      return siguiente;
    });
  }, [roster, asistencia, cursoId, fecha]);

  const sdePorCadete = useMemo(() => new Map((resumen?.cadetes ?? []).map((f) => [f.matricula, f])), [resumen]);

  // FB-F-15: no concluir "Curso no encontrado" mientras la lista de cursos aún carga.
  if (cargandoCursos || isLoading) return <Loader />;
  if (errorCursos) return <Alert color="red">No fue posible cargar el curso.</Alert>;
  if (!curso) return <Alert color="red">Curso no encontrado.</Alert>;

  const cambiarFecha = (v: string) => {
    if (dirty && !window.confirm(MENSAJE_DIRTY)) return;
    setFecha(v);
  };

  const marcarCodigo = (matricula: string, codigo: Codigo) => {
    celdasDirty.current.add(matricula);
    setDirty(true);
    setCodigos((prev) => ({ ...prev, [matricula]: codigo }));
  };

  const guardar = () => {
    const registros = (roster ?? [])
      .filter((c) => c.estatus !== 'BajaDefinitiva')
      .map((c) => ({ cadeteMatricula: c.matricula, codigo: codigos[c.matricula] ?? ('A' as Codigo) }));
    capturar.mutate(
      { fecha, registros },
      {
        onSuccess: (r) => {
          celdasDirty.current.clear();
          setDirty(false);
          notifications.show({
            color: r.offline ? 'yellow' : 'green',
            message: r.offline ? 'Sin conexión: guardado local, se sincronizará al reconectar.' : 'Asistencia guardada.',
          });
        },
        onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar la asistencia') }),
      },
    );
  };

  const LEYENDA: { cod: Codigo; fg: string; bg: string }[] = [
    { cod: 'A', fg: '#16a34a', bg: '#dcfce7' },
    { cod: 'F', fg: '#b91c1c', bg: '#fee2e2' },
    { cod: 'R', fg: '#b45309', bg: '#fef3c7' },
    { cod: 'J', fg: '#1d4ed8', bg: '#eff6ff' },
  ];

  return (
    <Stack className="sga-anim-in">
      <CursoContextBar cursoId={cursoId} curso={curso} activo="asistencia" />

      <Group align="flex-end" wrap="wrap" gap={22}>
        <TextInput type="date" label="Fecha" value={fecha} onChange={(e) => cambiarFecha(e.currentTarget.value)} w={160} />
        <div>
          <Text size="sm" fw={500} mb={6} id="label-parcial-sde" c="var(--sga-text)">
            Parcial (para SDE)
          </Text>
          <SegmentedControl value={parcial} onChange={setParcial} data={['1', '2', '3']} aria-labelledby="label-parcial-sde" />
        </div>
        <Group gap={10} ml="auto" align="center">
          <Group gap={8} visibleFrom="sm" aria-hidden>
            {LEYENDA.map((l) => (
              <Group key={l.cod} gap={5} wrap="nowrap">
                <Box style={{ width: 18, height: 18, borderRadius: 5, background: l.bg, color: l.fg, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {l.cod}
                </Box>
              </Group>
            ))}
          </Group>
          <Button onClick={guardar} loading={capturar.isPending}>
            Guardar asistencia
          </Button>
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={640}>
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
              <Table.Tr
                key={c.matricula}
                style={{
                  background: bajaDef ? 'var(--sga-danger-row)' : resumenFila?.sde ? 'var(--sga-warning-row)' : undefined,
                  opacity: bajaDef ? 0.75 : undefined,
                }}
              >
                <Table.Td>
                  <Text size="sm" fw={500} c="var(--sga-text-strong)">
                    {c.nombreCompleto}
                  </Text>
                  <Text size="xs" c="var(--sga-text-faint)" ff="JetBrains Mono">
                    {c.matricula}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <SegmentedControl
                    size="xs"
                    disabled={bajaDef}
                    aria-label={`Código de asistencia ${c.nombreCompleto}`}
                    value={codigos[c.matricula] ?? 'A'}
                    onChange={(v) => marcarCodigo(c.matricula, v as Codigo)}
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
                  {bajaDef && <StatusPill tono="danger">Baja definitiva</StatusPill>}
                  {!bajaDef && resumenFila?.sde && <StatusPill tono="warning">SDE</StatusPill>}
                  {!bajaDef && resumenFila && !resumenFila.sde && <StatusPill tono="success">Con derecho</StatusPill>}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
