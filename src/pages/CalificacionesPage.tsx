import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { MENSAJE_DIRTY, useDirtyGuard } from '../lib/useDirtyGuard';
import { esEditable, useParciales } from '../features/parciales';
import {
  examenInicial,
  useCalculo,
  useCapturarCalificaciones,
  useCapturarExamen,
  useCrearActividad,
  useMatriz,
  type Matriz,
  type TipoCategoria,
} from '../features/calificaciones';

const TIPOS: TipoCategoria[] = ['TI', 'TE', 'TA'];

type Seccion = 'actividad' | 'examen';

function CrearActividad({ cursoId, numero, editable }: { cursoId: string; numero: number; editable: boolean }) {
  const crear = useCrearActividad(cursoId, numero);
  const [tipo, setTipo] = useState<TipoCategoria>('TI');
  const [nombre, setNombre] = useState('');
  return (
    <Group align="flex-end">
      <Select label="Categoría" w={100} data={TIPOS} value={tipo} onChange={(v) => setTipo((v as TipoCategoria) ?? 'TI')} allowDeselect={false} disabled={!editable} />
      <TextInput label="Nombre de la actividad" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} disabled={!editable} />
      <Button
        variant="light"
        disabled={!editable || !nombre.trim()}
        loading={crear.isPending}
        onClick={() =>
          crear.mutate(
            { tipo, nombre: nombre.trim() },
            {
              onSuccess: () => {
                setNombre('');
                notifications.show({ color: 'green', message: 'Actividad creada' });
              },
              onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible crear la actividad') }),
            },
          )
        }
      >
        Agregar actividad
      </Button>
    </Group>
  );
}

function CapturaActividad({
  cursoId,
  numero,
  matriz,
  editable,
  onDirty,
}: {
  cursoId: string;
  numero: number;
  matriz: Matriz;
  editable: boolean;
  onDirty: (dirty: boolean) => void;
}) {
  const capturar = useCapturarCalificaciones(cursoId, numero);
  const [actividadId, setActividadId] = useState<string | null>(matriz.actividades[0]?.id ?? null);
  const [notas, setNotas] = useState<Record<string, number | ''>>({});
  const celdasDirty = useRef(new Set<string>());
  const [dirty, setDirty] = useState(false);
  const actividadInit = useRef<string | null>(null);

  // Si la actividad seleccionada ya no existe en la matriz (cambio de datos), vuelve a la primera.
  useEffect(() => {
    if (actividadId && matriz.actividades.some((a) => a.id === actividadId)) return;
    setActividadId(matriz.actividades[0]?.id ?? null);
  }, [actividadId, matriz]);

  // FB-F-13: init keyed por actividad. Un refetch de la matriz (p. ej. tras guardar otra
  // sección) solo refresca celdas no tocadas; lo tecleado sin guardar se conserva.
  useEffect(() => {
    if (!actividadId) return;
    const base = Object.fromEntries(matriz.cadetes.map((c) => [c.matricula, matriz.calificaciones[c.matricula]?.[actividadId] ?? ('' as const)]));
    if (actividadInit.current !== actividadId) {
      actividadInit.current = actividadId;
      celdasDirty.current.clear();
      setDirty(false);
      onDirty(false);
      setNotas(base);
      return;
    }
    setNotas((prev) => {
      const siguiente = { ...base };
      for (const m of celdasDirty.current) if (m in prev) siguiente[m] = prev[m];
      return siguiente;
    });
  }, [actividadId, matriz, onDirty]);

  if (matriz.actividades.length === 0) return <Text c="dimmed">Crea una actividad para capturar calificaciones.</Text>;

  const cambiarActividad = (v: string | null) => {
    if (dirty && !window.confirm(MENSAJE_DIRTY)) return;
    setActividadId(v);
  };

  const marcarNota = (matricula: string, v: number | '') => {
    celdasDirty.current.add(matricula);
    setDirty(true);
    onDirty(true);
    setNotas((prev) => ({ ...prev, [matricula]: v }));
  };

  const guardar = () => {
    if (!actividadId) return;
    const registros = matriz.cadetes
      .filter((c) => c.estatus !== 'BajaDefinitiva' && notas[c.matricula] !== '' && notas[c.matricula] !== undefined)
      .map((c) => ({ cadeteMatricula: c.matricula, valor: Number(notas[c.matricula]) }));
    capturar.mutate(
      { actividadId, registros },
      {
        onSuccess: () => {
          celdasDirty.current.clear();
          setDirty(false);
          onDirty(false);
          notifications.show({ color: 'green', message: 'Calificaciones guardadas' });
        },
        onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar') }),
      },
    );
  };

  return (
    <Stack>
      <Group align="flex-end">
        <Select
          label="Actividad"
          w={220}
          data={matriz.actividades.map((a) => ({ value: a.id, label: `${a.tipo} ${a.orden} — ${a.nombre}` }))}
          value={actividadId}
          onChange={cambiarActividad}
          allowDeselect={false}
        />
        <Button variant="light" disabled={!editable} loading={capturar.isPending} onClick={guardar}>
          Guardar calificaciones
        </Button>
      </Group>
      <Table.ScrollContainer minWidth={420}>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cadete</Table.Th>
              <Table.Th>Calificación [0-10]</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matriz.cadetes.map((c) => (
              <Table.Tr key={c.matricula}>
                <Table.Td>{c.nombreCompleto}</Table.Td>
                <Table.Td>
                  <NumberInput
                    size="xs"
                    w={110}
                    min={0}
                    max={10}
                    step={0.1}
                    disabled={!editable || c.estatus === 'BajaDefinitiva'}
                    value={notas[c.matricula] ?? ''}
                    onChange={(v) => marcarNota(c.matricula, v === '' ? '' : Number(v))}
                    aria-label={`Calificación ${c.nombreCompleto}`}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function CapturaExamen({
  cursoId,
  numero,
  matriz,
  editable,
  onDirty,
}: {
  cursoId: string;
  numero: number;
  matriz: Matriz;
  editable: boolean;
  onDirty: (dirty: boolean) => void;
}) {
  const capturar = useCapturarExamen(cursoId, numero);
  const { data: calculo } = useCalculo(cursoId, numero);
  const [valores, setValores] = useState<Record<string, { valor: number | ''; np: boolean }>>({});
  const celdasDirty = useRef(new Set<string>());

  // FB-F-13: merge que respeta celdas tocadas; el refetch de la matriz no borra lo tecleado.
  useEffect(() => {
    const base = Object.fromEntries(matriz.cadetes.map((c) => [c.matricula, examenInicial(matriz.examenes[c.matricula])]));
    setValores((prev) => {
      const siguiente = { ...base };
      for (const m of celdasDirty.current) if (prev[m]) siguiente[m] = prev[m];
      return siguiente;
    });
  }, [matriz]);

  const sde = useMemo(() => new Map((calculo?.cadetes ?? []).map((f) => [f.matricula, f.sde])), [calculo]);

  const marcarValor = (matricula: string, v: { valor: number | ''; np: boolean }) => {
    celdasDirty.current.add(matricula);
    onDirty(true);
    setValores((prev) => ({ ...prev, [matricula]: v }));
  };

  const guardar = () => {
    const registros = matriz.cadetes
      .filter((c) => c.estatus !== 'BajaDefinitiva' && !sde.get(c.matricula))
      .flatMap((c): { cadeteMatricula: string; valor?: number; np?: boolean }[] => {
        const v = valores[c.matricula];
        if (!v) return [];
        if (v.np) return [{ cadeteMatricula: c.matricula, np: true }];
        if (v.valor === '') return [];
        return [{ cadeteMatricula: c.matricula, valor: Number(v.valor) }];
      });
    if (registros.length === 0) {
      notifications.show({ color: 'yellow', message: 'Nada que guardar (revisa SDE / valores vacíos).' });
      return;
    }
    capturar.mutate(registros, {
      onSuccess: () => {
        celdasDirty.current.clear();
        onDirty(false);
        notifications.show({ color: 'green', message: 'Examen guardado' });
      },
      onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar el examen') }),
    });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>Examen del parcial</Text>
        <Button variant="light" disabled={!editable} loading={capturar.isPending} onClick={guardar}>
          Guardar examen
        </Button>
      </Group>
      <Table.ScrollContainer minWidth={480}>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cadete</Table.Th>
              <Table.Th>Valor</Table.Th>
              <Table.Th>NP</Table.Th>
              <Table.Th>SDE</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matriz.cadetes.map((c) => {
              const esSde = sde.get(c.matricula) ?? false;
              const v = valores[c.matricula] ?? { valor: '', np: false };
              return (
                <Table.Tr key={c.matricula}>
                  <Table.Td>{c.nombreCompleto}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      size="xs"
                      w={100}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={!editable || esSde || v.np || c.estatus === 'BajaDefinitiva'}
                      value={v.valor}
                      onChange={(nv) => marcarValor(c.matricula, { valor: nv === '' ? '' : Number(nv), np: false })}
                      aria-label={`Examen ${c.nombreCompleto}`}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={v.np}
                      disabled={!editable || esSde || c.estatus === 'BajaDefinitiva'}
                      onChange={(e) => marcarValor(c.matricula, { valor: '', np: e.currentTarget.checked })}
                      aria-label={`NP ${c.nombreCompleto}`}
                    />
                  </Table.Td>
                  <Table.Td>{esSde && <Badge color="orange">SDE</Badge>}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function Resultados({ cursoId, numero }: { cursoId: string; numero: number }) {
  const { data } = useCalculo(cursoId, numero);
  if (!data) return null;
  return (
    <Table.ScrollContainer minWidth={560}>
      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Cadete</Table.Th>
            <Table.Th>TI · TE · TA</Table.Th>
            <Table.Th>EC</Table.Th>
            <Table.Th>Cruda</Table.Th>
            <Table.Th>Final</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.cadetes.map((f) => (
            <Table.Tr key={f.matricula}>
              <Table.Td>{f.nombreCompleto}</Table.Td>
              <Table.Td>
                {f.promTI.toFixed(1)} · {f.promTE.toFixed(1)} · {f.promTA.toFixed(1)}
              </Table.Td>
              <Table.Td>{f.evaluacionContinua.toFixed(2)}</Table.Td>
              <Table.Td>{f.califCruda.toFixed(2)}</Table.Td>
              <Table.Td>
                <Text fw={600}>{f.califFinal}</Text>
                {f.sde && <Badge color="orange" ml="xs">SDE</Badge>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

export function CalificacionesPage() {
  const { cursoId = '' } = useParams();
  const [parcial, setParcial] = useState('1');
  const numero = Number(parcial);
  const { data: matriz, isLoading, isError } = useMatriz(cursoId, numero);
  const { data: parciales } = useParciales(cursoId);
  const [seccionesDirty, setSeccionesDirty] = useState<Partial<Record<Seccion, boolean>>>({});

  const hayDirty = Object.values(seccionesDirty).some(Boolean);
  useDirtyGuard(hayDirty);

  const marcarSeccion = useCallback(
    (seccion: Seccion) => (dirty: boolean) =>
      setSeccionesDirty((prev) => (prev[seccion] === dirty ? prev : { ...prev, [seccion]: dirty })),
    [],
  );
  const onDirtyActividad = useMemo(() => marcarSeccion('actividad'), [marcarSeccion]);
  const onDirtyExamen = useMemo(() => marcarSeccion('examen'), [marcarSeccion]);

  // FB-F-15: gating visual — el servidor sigue siendo la autoridad (RN-06 se valida allá).
  const parcialActual = parciales?.find((p) => p.numero === numero);
  const editable = parcialActual ? esEditable(parcialActual.estado) : true;

  const cambiarParcial = (v: string) => {
    if (hayDirty && !window.confirm(MENSAJE_DIRTY)) return;
    setSeccionesDirty({});
    setParcial(v);
  };

  return (
    <Stack className="sga-anim-in">
      <Group justify="space-between">
        <Title order={3}>Calificaciones — Parcial {parcial}</Title>
        <SegmentedControl value={parcial} onChange={cambiarParcial} data={['1', '2', '3']} aria-label="Parcial" />
      </Group>

      {isLoading && <Loader />}
      {isError && <Alert color="red">No fue posible cargar las calificaciones.</Alert>}
      {!editable && parcialActual && (
        <Alert color="blue" title={`Parcial ${parcialActual.estado.toLowerCase() === 'validado' ? 'validado' : 'cerrado'}`}>
          Captura bloqueada: este parcial está en estado {parcialActual.estado}. Solicita la reapertura a Coordinación (RN-06).
        </Alert>
      )}
      {matriz && (
        <>
          <Card withBorder radius="md">
            <CrearActividad cursoId={cursoId} numero={numero} editable={editable} />
          </Card>
          <Card withBorder radius="md">
            <CapturaActividad key={numero} cursoId={cursoId} numero={numero} matriz={matriz} editable={editable} onDirty={onDirtyActividad} />
          </Card>
          <Card withBorder radius="md">
            <CapturaExamen key={numero} cursoId={cursoId} numero={numero} matriz={matriz} editable={editable} onDirty={onDirtyExamen} />
          </Card>
          <Divider label="Resultado del parcial" />
          <Resultados cursoId={cursoId} numero={numero} />
        </>
      )}
    </Stack>
  );
}
