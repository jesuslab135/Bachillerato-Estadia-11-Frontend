import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Card, Group, Loader, Modal, NumberInput, Stack, Text, Textarea, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { useAuth } from '../auth/AuthContext';
import { useCursos } from '../features/asistencia';
import { CursoContextBar } from '../components/CursoContextBar';
import { StatusPill, type Tono } from '../components/ui';
import {
  accionesWorkflow,
  esEditable,
  pesosValidos,
  useEditarPesos,
  useParciales,
  useTransicionParcial,
  type AccionWorkflow,
  type Parcial,
  type Pesos,
} from '../features/parciales';

// El backend exige un motivo de reapertura de al menos 30 caracteres (RN-06).
const MIN_MOTIVO = 30;

const TONO_ESTADO: Record<string, Tono> = {
  Borrador: 'neutral',
  CerradoDocente: 'blue',
  Validado: 'success',
  Reabierto: 'warning',
};

function ParcialCard({ cursoId, parcial }: { cursoId: string; parcial: Parcial }) {
  const { sesion } = useAuth();
  const editarPesos = useEditarPesos(cursoId);
  const transicion = useTransicionParcial(cursoId);
  const [pesos, setPesos] = useState<Pesos>({ ti: parcial.pesoTI, te: parcial.pesoTE, ta: parcial.pesoTA, ex: parcial.pesoEX });

  useEffect(() => {
    setPesos({ ti: parcial.pesoTI, te: parcial.pesoTE, ta: parcial.pesoTA, ex: parcial.pesoEX });
  }, [parcial.pesoTI, parcial.pesoTE, parcial.pesoTA, parcial.pesoEX]);

  const editable = esEditable(parcial.estado);
  const validos = pesosValidos(pesos);
  const acciones = sesion ? accionesWorkflow(parcial.estado, sesion.rol) : [];

  const set = (k: keyof Pesos) => (v: number | string) => setPesos((p) => ({ ...p, [k]: typeof v === 'number' ? v : Number(v) || 0 }));

  const [modalReabrir, setModalReabrir] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState('');
  const motivoValido = motivoReapertura.trim().length >= MIN_MOTIVO;

  const mutarTransicion = (accion: AccionWorkflow, extras: { motivo?: string; comentario?: string } = {}) =>
    transicion.mutate(
      { numero: parcial.numero, accion, ...extras },
      {
        onSuccess: () => {
          setModalReabrir(false);
          notifications.show({ color: 'green', message: `Parcial ${parcial.numero}: ${accion} aplicado` });
        },
        onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, `No fue posible ${accion}`) }),
      },
    );

  const ejecutar = (accion: AccionWorkflow) => {
    if (accion === 'reabrir') {
      setMotivoReapertura('');
      setModalReabrir(true);
      return;
    }
    if (accion === 'devolver') {
      const comentario = window.prompt('Comentario de devolución:') ?? undefined;
      if (!comentario) return;
      mutarTransicion(accion, { comentario });
      return;
    }
    mutarTransicion(accion);
  };

  return (
    <Card withBorder radius="lg" padding="lg" shadow="xs" className="sga-card-hover">
      <Group justify="space-between" mb="sm">
        <Title order={4}>Parcial {parcial.numero}</Title>
        <StatusPill tono={TONO_ESTADO[parcial.estado] ?? 'neutral'}>{parcial.estado}</StatusPill>
      </Group>

      <Group align="flex-end" wrap="wrap">
        {(['ti', 'te', 'ta', 'ex'] as const).map((k) => (
          <NumberInput
            key={k}
            label={k.toUpperCase()}
            w={90}
            min={0}
            max={1}
            step={0.05}
            decimalScale={2}
            disabled={!editable}
            value={pesos[k]}
            onChange={set(k)}
          />
        ))}
        {editable && (
          <Button
            variant="light"
            disabled={!validos}
            loading={editarPesos.isPending}
            onClick={() =>
              editarPesos.mutate(
                { numero: parcial.numero, pesos },
                {
                  onSuccess: () => notifications.show({ color: 'green', message: 'Ponderación guardada' }),
                  onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, 'No fue posible guardar la ponderación') }),
                },
              )
            }
          >
            Guardar ponderación
          </Button>
        )}
      </Group>
      {editable && !validos && (
        <Text size="xs" c="red" mt={4}>
          Los pesos deben sumar 1.0 y el examen estar en [0.20, 0.70] (RN-02).
        </Text>
      )}

      {acciones.length > 0 && (
        <Group mt="md" gap="xs">
          {acciones.map((a) => (
            <Button key={a} size="xs" variant="outline" loading={transicion.isPending} onClick={() => ejecutar(a)}>
              {a}
            </Button>
          ))}
        </Group>
      )}

      <Modal
        opened={modalReabrir}
        onClose={() => setModalReabrir(false)}
        title={`Reabrir parcial ${parcial.numero}`}
        centered
      >
        <Stack>
          <Textarea
            label="Motivo de reapertura"
            description={`Mínimo ${MIN_MOTIVO} caracteres; queda registrado en la bitácora (RN-06).`}
            autosize
            minRows={3}
            value={motivoReapertura}
            onChange={(e) => setMotivoReapertura(e.currentTarget.value)}
            data-autofocus
          />
          <Text size="xs" c={motivoValido ? 'dimmed' : 'red'}>
            {motivoReapertura.trim().length}/{MIN_MOTIVO} caracteres
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalReabrir(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!motivoValido}
              loading={transicion.isPending}
              onClick={() => mutarTransicion('reabrir', { motivo: motivoReapertura.trim() })}
            >
              Reabrir parcial
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}

export function ParcialesPage() {
  const { cursoId = '' } = useParams();
  const { data, isLoading, isError } = useParciales(cursoId);
  const { data: cursos } = useCursos();
  const curso = cursos?.find((c) => c.id === cursoId);

  if (isLoading) return <Loader />;
  if (isError) return <Alert color="red">No fue posible cargar los parciales.</Alert>;

  return (
    <Stack className="sga-anim-in">
      {curso ? (
        <CursoContextBar cursoId={cursoId} curso={curso} activo="parciales" />
      ) : (
        <Title order={1}>Parciales y ponderación</Title>
      )}
      {(data ?? []).map((p) => (
        <ParcialCard key={p.numero} cursoId={cursoId} parcial={p} />
      ))}
    </Stack>
  );
}
