import { useEffect, useMemo, useState } from 'react';
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

function CrearActividad({ cursoId, numero }: { cursoId: string; numero: number }) {
  const crear = useCrearActividad(cursoId, numero);
  const [tipo, setTipo] = useState<TipoCategoria>('TI');
  const [nombre, setNombre] = useState('');
  return (
    <Group align="flex-end">
      <Select label="Categoría" w={100} data={TIPOS} value={tipo} onChange={(v) => setTipo((v as TipoCategoria) ?? 'TI')} allowDeselect={false} />
      <TextInput label="Nombre de la actividad" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
      <Button
        variant="light"
        disabled={!nombre.trim()}
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

function CapturaActividad({ cursoId, numero, matriz }: { cursoId: string; numero: number; matriz: Matriz }) {
  const capturar = useCapturarCalificaciones(cursoId, numero);
  const [actividadId, setActividadId] = useState<string | null>(matriz.actividades[0]?.id ?? null);
  const [notas, setNotas] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    if (!actividadId) return;
    setNotas(Object.fromEntries(matriz.cadetes.map((c) => [c.matricula, matriz.calificaciones[c.matricula]?.[actividadId] ?? ''])));
  }, [actividadId, matriz]);

  if (matriz.actividades.length === 0) return <Text c="dimmed">Crea una actividad para capturar calificaciones.</Text>;

  const guardar = () => {
    if (!actividadId) return;
    const registros = matriz.cadetes
      .filter((c) => c.estatus !== 'BajaDefinitiva' && notas[c.matricula] !== '' && notas[c.matricula] !== undefined)
      .map((c) => ({ cadeteMatricula: c.matricula, valor: Number(notas[c.matricula]) }));
    capturar.mutate(
      { actividadId, registros },
      {
        onSuccess: () => notifications.show({ color: 'green', message: 'Calificaciones guardadas' }),
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
          onChange={setActividadId}
          allowDeselect={false}
        />
        <Button variant="light" loading={capturar.isPending} onClick={guardar}>
          Guardar calificaciones
        </Button>
      </Group>
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
                  disabled={c.estatus === 'BajaDefinitiva'}
                  value={notas[c.matricula] ?? ''}
                  onChange={(v) => setNotas((prev) => ({ ...prev, [c.matricula]: v === '' ? '' : Number(v) }))}
                  aria-label={`Calificación ${c.nombreCompleto}`}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function CapturaExamen({ cursoId, numero, matriz }: { cursoId: string; numero: number; matriz: Matriz }) {
  const capturar = useCapturarExamen(cursoId, numero);
  const { data: calculo } = useCalculo(cursoId, numero);
  const [valores, setValores] = useState<Record<string, { valor: number | ''; np: boolean }>>({});

  useEffect(() => {
    setValores(Object.fromEntries(matriz.cadetes.map((c) => [c.matricula, examenInicial(matriz.examenes[c.matricula])])));
  }, [matriz]);

  const sde = useMemo(() => new Map((calculo?.cadetes ?? []).map((f) => [f.matricula, f.sde])), [calculo]);

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
      onSuccess: () => notifications.show({ color: 'green', message: 'Examen guardado' }),
      onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar el examen') }),
    });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={600}>Examen del parcial</Text>
        <Button variant="light" loading={capturar.isPending} onClick={guardar}>
          Guardar examen
        </Button>
      </Group>
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
                    disabled={esSde || v.np || c.estatus === 'BajaDefinitiva'}
                    value={v.valor}
                    onChange={(nv) => setValores((prev) => ({ ...prev, [c.matricula]: { valor: nv === '' ? '' : Number(nv), np: false } }))}
                    aria-label={`Examen ${c.nombreCompleto}`}
                  />
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={v.np}
                    disabled={esSde || c.estatus === 'BajaDefinitiva'}
                    onChange={(e) => setValores((prev) => ({ ...prev, [c.matricula]: { valor: '', np: e.currentTarget.checked } }))}
                    aria-label={`NP ${c.nombreCompleto}`}
                  />
                </Table.Td>
                <Table.Td>{esSde && <Badge color="orange">SDE</Badge>}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function Resultados({ cursoId, numero }: { cursoId: string; numero: number }) {
  const { data } = useCalculo(cursoId, numero);
  if (!data) return null;
  return (
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
  );
}

export function CalificacionesPage() {
  const { cursoId = '' } = useParams();
  const [parcial, setParcial] = useState('1');
  const numero = Number(parcial);
  const { data: matriz, isLoading, isError } = useMatriz(cursoId, numero);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Calificaciones — Parcial {parcial}</Title>
        <SegmentedControl value={parcial} onChange={setParcial} data={['1', '2', '3']} />
      </Group>

      {isLoading && <Loader />}
      {isError && <Alert color="red">No fue posible cargar las calificaciones.</Alert>}
      {matriz && (
        <>
          <Card withBorder radius="md">
            <CrearActividad cursoId={cursoId} numero={numero} />
          </Card>
          <Card withBorder radius="md">
            <CapturaActividad cursoId={cursoId} numero={numero} matriz={matriz} />
          </Card>
          <Card withBorder radius="md">
            <CapturaExamen cursoId={cursoId} numero={numero} matriz={matriz} />
          </Card>
          <Divider label="Resultado del parcial" />
          <Resultados cursoId={cursoId} numero={numero} />
        </>
      )}
    </Stack>
  );
}
