import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CopyButton,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { SectionTitle, StatusPill } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { useCursos } from '../features/asistencia';
import { useGrupos } from '../features/cadetes';
import {
  cursoCompleto,
  useActivarPeriodo,
  useCrearCurso,
  useCrearGrupo,
  useCrearPeriodo,
  useDocentes,
  useMaterias,
  usePeriodos,
  usePlanteles,
  type FormCurso,
} from '../features/catalogos';

function ok(msg: string) {
  notifications.show({ color: 'green', message: msg });
}
function fail(e: unknown, def: string) {
  notifications.show({ color: 'red', message: mensajeError(e, def) });
}

function Vacio({ colSpan, texto }: { colSpan: number; texto: string }) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan}>
        <Text c="dimmed" size="sm">
          {texto}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}

function SeccionGrupos({ plantelId }: { plantelId: string }) {
  const { data: grupos } = useGrupos();
  const crear = useCrearGrupo();
  const [nombre, setNombre] = useState('');
  const [semestre, setSemestre] = useState<number | string>(1);
  return (
    <Stack>
      <Card withBorder radius="lg" padding={22} shadow="xs">
        <Box mb="sm">
          <SectionTitle>Nuevo grupo</SectionTitle>
        </Box>
        <Group align="flex-end">
          <TextInput label="Nombre" placeholder="2do A" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
          <NumberInput label="Semestre" w={110} min={1} max={6} value={semestre} onChange={setSemestre} />
          <Button
            disabled={!nombre.trim()}
            loading={crear.isPending}
            onClick={() =>
              crear.mutate(
                { plantelId, nombre: nombre.trim(), semestre: Number(semestre) },
                { onSuccess: () => { setNombre(''); ok('Grupo creado'); }, onError: (e) => fail(e, 'No fue posible crear el grupo') },
              )
            }
          >
            Agregar grupo
          </Button>
        </Group>
      </Card>

      <Table.ScrollContainer minWidth={520}>
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Semestre</Table.Th>
              <Table.Th>ID (para importar)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(grupos ?? []).map((g) => (
              <Table.Tr key={g.id}>
                <Table.Td>{g.nombre}</Table.Td>
                <Table.Td>{g.semestre}</Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {g.id}
                    </Text>
                    <CopyButton value={g.id}>
                      {({ copied, copy }) => (
                        <Button size="xs" variant="subtle" onClick={copy}>
                          {copied ? 'Copiado' : 'Copiar'}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {(grupos ?? []).length === 0 && <Vacio colSpan={3} texto="Aún no hay grupos." />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function SeccionPeriodos({ plantelId }: { plantelId: string }) {
  const { data: periodos } = usePeriodos();
  const crear = useCrearPeriodo();
  const activar = useActivarPeriodo();
  const [codigo, setCodigo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  return (
    <Stack>
      <Card withBorder radius="lg" padding={22} shadow="xs">
        <Box mb="sm">
          <SectionTitle>Nuevo periodo</SectionTitle>
        </Box>
        <Group align="flex-end">
          <TextInput label="Código" placeholder="2025-2026-1" value={codigo} onChange={(e) => setCodigo(e.currentTarget.value)} />
          <TextInput type="date" label="Inicio" value={inicio} onChange={(e) => setInicio(e.currentTarget.value)} />
          <TextInput type="date" label="Fin" value={fin} onChange={(e) => setFin(e.currentTarget.value)} />
          <Button
            disabled={!codigo.trim() || !inicio || !fin}
            loading={crear.isPending}
            onClick={() =>
              crear.mutate(
                { plantelId, codigo: codigo.trim(), fechaInicio: inicio, fechaFin: fin },
                { onSuccess: () => { setCodigo(''); ok('Periodo creado'); }, onError: (e) => fail(e, 'No fue posible crear el periodo') },
              )
            }
          >
            Agregar periodo
          </Button>
        </Group>
      </Card>

      <Table.ScrollContainer minWidth={520}>
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Código</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(periodos ?? []).map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.codigo}</Table.Td>
                <Table.Td>{p.activo ? <StatusPill tono="success">Activo</StatusPill> : <StatusPill tono="neutral">Inactivo</StatusPill>}</Table.Td>
                <Table.Td>
                  {!p.activo && (
                    <Button size="xs" variant="subtle" loading={activar.isPending} onClick={() => activar.mutate(p.id, { onSuccess: () => ok('Periodo activado'), onError: (e) => fail(e, 'No fue posible activar') })}>
                      Activar
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
            {(periodos ?? []).length === 0 && <Vacio colSpan={3} texto="Aún no hay periodos." />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function SeccionCursos() {
  const { data: materias } = useMaterias();
  const { data: grupos } = useGrupos();
  const { data: docentes } = useDocentes();
  const { data: periodos } = usePeriodos();
  const { data: cursos } = useCursos();
  const crear = useCrearCurso();
  const [form, setForm] = useState<FormCurso>({ materiaId: null, grupoId: null, docenteId: null, periodoId: null });
  const set = (k: keyof FormCurso) => (v: string | null) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Stack>
      <Card withBorder radius="lg" padding={22} shadow="xs">
        <Box mb="sm">
          <SectionTitle>Nuevo curso</SectionTitle>
        </Box>
        <Group align="flex-end" wrap="wrap">
          <Select label="Materia" w={200} searchable data={(materias ?? []).map((m) => ({ value: m.id, label: `${m.clave} — ${m.nombre}` }))} value={form.materiaId} onChange={set('materiaId')} />
          <Select label="Grupo" w={150} data={(grupos ?? []).map((g) => ({ value: g.id, label: g.nombre }))} value={form.grupoId} onChange={set('grupoId')} />
          <Select label="Docente" w={200} data={(docentes ?? []).map((d) => ({ value: d.id, label: d.nombreCompleto }))} value={form.docenteId} onChange={set('docenteId')} />
          <Select label="Periodo" w={160} data={(periodos ?? []).map((p) => ({ value: p.id, label: p.codigo }))} value={form.periodoId} onChange={set('periodoId')} />
          <Button
            disabled={!cursoCompleto(form)}
            loading={crear.isPending}
            onClick={() =>
              crear.mutate(
                { materiaId: form.materiaId!, grupoId: form.grupoId!, docenteId: form.docenteId!, periodoId: form.periodoId! },
                {
                  onSuccess: () => { setForm({ materiaId: null, grupoId: null, docenteId: null, periodoId: null }); ok('Curso creado (3 parciales + 15 criterios)'); },
                  onError: (e) => fail(e, 'No fue posible crear el curso'),
                },
              )
            }
          >
            Crear curso
          </Button>
        </Group>
        <Group gap={7} mt="sm" wrap="nowrap">
          <IconInfoCircle size={15} color="var(--sga-text-faint)" />
          <Text fz={12} c="var(--sga-text-faint)">
            Al crear el curso se generan automáticamente 3 parciales y 15 criterios de evaluación.
          </Text>
        </Group>
      </Card>

      <Table.ScrollContainer minWidth={520}>
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Materia</Table.Th>
              <Table.Th>Grupo</Table.Th>
              <Table.Th>Periodo</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(cursos ?? []).map((c) => (
              <Table.Tr key={c.id}>
                <Table.Td>
                  {c.materia.clave} — {c.materia.nombre}
                </Table.Td>
                <Table.Td>{c.grupo.nombre}</Table.Td>
                <Table.Td>
                  <Text size="sm" ff="JetBrains Mono" c="var(--sga-text-muted)">
                    {c.periodo?.codigo ?? '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
            {(cursos ?? []).length === 0 && <Vacio colSpan={3} texto="Aún no hay cursos." />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

export function CatalogosPage() {
  const { sesion } = useAuth();
  const { data: planteles } = usePlanteles();
  const [plantelSel, setPlantelSel] = useState<string | null>(null);
  const plantelId = sesion?.plantelId ?? plantelSel;

  return (
    <Stack gap={24} className="sga-anim-in">
      <div>
        <Title order={1}>Catálogos y cursos</Title>
        <Text c="var(--sga-text-muted)" mt={6} fz={14}>
          Administración del plantel.
        </Text>
      </div>
      {!sesion?.plantelId && (
        <Select
          label="Plantel (Operador)"
          w={280}
          placeholder="Selecciona un plantel"
          data={(planteles ?? []).map((p) => ({ value: p.id, label: `${p.clave} — ${p.nombre}` }))}
          value={plantelSel}
          onChange={setPlantelSel}
        />
      )}
      {!plantelId ? (
        <Alert color="blue">Selecciona un plantel para administrar sus catálogos.</Alert>
      ) : (
        <Tabs defaultValue="grupos" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="grupos">Grupos</Tabs.Tab>
            <Tabs.Tab value="periodos">Periodos</Tabs.Tab>
            <Tabs.Tab value="cursos">Cursos</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="grupos" pt="md">
            <SeccionGrupos plantelId={plantelId} />
          </Tabs.Panel>
          <Tabs.Panel value="periodos" pt="md">
            <SeccionPeriodos plantelId={plantelId} />
          </Tabs.Panel>
          <Tabs.Panel value="cursos" pt="md">
            <SeccionCursos />
          </Tabs.Panel>
        </Tabs>
      )}
    </Stack>
  );
}
