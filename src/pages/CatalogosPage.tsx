import { useState } from 'react';
import { Alert, Badge, Button, Card, Group, NumberInput, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
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

function SeccionGrupos({ plantelId }: { plantelId: string }) {
  const { data: grupos } = useGrupos();
  const crear = useCrearGrupo();
  const [nombre, setNombre] = useState('');
  const [semestre, setSemestre] = useState<number | string>(1);
  return (
    <Card withBorder radius="md">
      <Title order={4} mb="sm">
        Grupos
      </Title>
      <Group align="flex-end" mb="sm">
        <TextInput label="Nombre" placeholder="2do A" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
        <NumberInput label="Semestre" w={110} min={1} max={6} value={semestre} onChange={setSemestre} />
        <Button
          variant="light"
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
      <Text size="sm" c="dimmed">
        {(grupos ?? []).map((g) => `${g.nombre} (sem. ${g.semestre})`).join(' · ') || 'Sin grupos'}
      </Text>
    </Card>
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
    <Card withBorder radius="md">
      <Title order={4} mb="sm">
        Periodos
      </Title>
      <Group align="flex-end" mb="sm">
        <TextInput label="Código" placeholder="2025-2026-1" value={codigo} onChange={(e) => setCodigo(e.currentTarget.value)} />
        <TextInput type="date" label="Inicio" value={inicio} onChange={(e) => setInicio(e.currentTarget.value)} />
        <TextInput type="date" label="Fin" value={fin} onChange={(e) => setFin(e.currentTarget.value)} />
        <Button
          variant="light"
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
      <Table withTableBorder>
        <Table.Tbody>
          {(periodos ?? []).map((p) => (
            <Table.Tr key={p.id}>
              <Table.Td>{p.codigo}</Table.Td>
              <Table.Td>{p.activo ? <Badge color="green">Activo</Badge> : <Badge color="gray">Inactivo</Badge>}</Table.Td>
              <Table.Td>
                {!p.activo && (
                  <Button size="xs" variant="subtle" loading={activar.isPending} onClick={() => activar.mutate(p.id, { onSuccess: () => ok('Periodo activado'), onError: (e) => fail(e, 'No fue posible activar') })}>
                    Activar
                  </Button>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
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
    <Card withBorder radius="md">
      <Title order={4} mb="sm">
        Cursos
      </Title>
      <Group align="flex-end" mb="sm" wrap="wrap">
        <Select label="Materia" w={200} searchable data={(materias ?? []).map((m) => ({ value: m.id, label: `${m.clave} — ${m.nombre}` }))} value={form.materiaId} onChange={set('materiaId')} />
        <Select label="Grupo" w={150} data={(grupos ?? []).map((g) => ({ value: g.id, label: g.nombre }))} value={form.grupoId} onChange={set('grupoId')} />
        <Select label="Docente" w={200} data={(docentes ?? []).map((d) => ({ value: d.id, label: d.nombreCompleto }))} value={form.docenteId} onChange={set('docenteId')} />
        <Select label="Periodo" w={160} data={(periodos ?? []).map((p) => ({ value: p.id, label: p.codigo }))} value={form.periodoId} onChange={set('periodoId')} />
        <Button
          variant="light"
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
      <Text size="sm" c="dimmed">
        {(cursos ?? []).map((c) => `${c.materia.clave}·${c.grupo.nombre}`).join(' · ') || 'Sin cursos'}
      </Text>
    </Card>
  );
}

export function CatalogosPage() {
  const { sesion } = useAuth();
  const { data: planteles } = usePlanteles();
  const [plantelSel, setPlantelSel] = useState<string | null>(null);
  const plantelId = sesion?.plantelId ?? plantelSel;

  return (
    <Stack>
      <Title order={3}>Catálogos y cursos</Title>
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
        <>
          <SeccionGrupos plantelId={plantelId} />
          <SeccionPeriodos plantelId={plantelId} />
          <SeccionCursos />
        </>
      )}
    </Stack>
  );
}
