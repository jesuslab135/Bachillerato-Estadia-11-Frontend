import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Group, Loader, NumberInput, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mensajeError } from '../api/errores';
import { useAuth } from '../auth/AuthContext';
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

const COLOR_ESTADO: Record<string, string> = {
  Borrador: 'gray',
  CerradoDocente: 'blue',
  Validado: 'green',
  Reabierto: 'orange',
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

  const ejecutar = (accion: AccionWorkflow) => {
    let motivo: string | undefined;
    let comentario: string | undefined;
    if (accion === 'reabrir') {
      motivo = window.prompt('Motivo de reapertura (mínimo 30 caracteres):') ?? undefined;
      if (!motivo) return;
    } else if (accion === 'devolver') {
      comentario = window.prompt('Comentario de devolución:') ?? undefined;
      if (!comentario) return;
    }
    transicion.mutate(
      { numero: parcial.numero, accion, motivo, comentario },
      {
        onSuccess: () => notifications.show({ color: 'green', message: `Parcial ${parcial.numero}: ${accion} aplicado` }),
        onError: (e) => notifications.show({ color: 'red', message: mensajeError(e, `No fue posible ${accion}`) }),
      },
    );
  };

  return (
    <Card withBorder radius="md" className="sga-card-hover">
      <Group justify="space-between" mb="sm">
        <Title order={4}>Parcial {parcial.numero}</Title>
        <Badge color={COLOR_ESTADO[parcial.estado] ?? 'gray'}>{parcial.estado}</Badge>
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
    </Card>
  );
}

export function ParcialesPage() {
  const { cursoId = '' } = useParams();
  const { data, isLoading, isError } = useParciales(cursoId);

  if (isLoading) return <Loader />;
  if (isError) return <Alert color="red">No fue posible cargar los parciales.</Alert>;

  return (
    <Stack className="sga-anim-in">
      <Title order={3}>Parciales y ponderación</Title>
      {(data ?? []).map((p) => (
        <ParcialCard key={p.numero} cursoId={cursoId} parcial={p} />
      ))}
    </Stack>
  );
}
