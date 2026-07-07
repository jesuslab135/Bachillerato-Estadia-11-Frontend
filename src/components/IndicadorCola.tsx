import { useSyncExternalStore } from 'react';
import { Badge, Button, Popover, Stack, Text } from '@mantine/core';
import { limpiarRechazadas, pendientes, rechazadas, suscribirCola } from '../api/offlineQueue';

// FB-F-11: visibilidad de la cola offline — capturas pendientes de sincronizar y
// capturas rechazadas por el servidor (con su motivo), descartables por el usuario.
export function IndicadorCola() {
  const nPendientes = useSyncExternalStore(suscribirCola, pendientes);
  const nRechazadas = useSyncExternalStore(suscribirCola, () => rechazadas().length);

  if (nPendientes === 0 && nRechazadas === 0) return null;

  const listaRechazadas = rechazadas();

  return (
    <Popover width={320} position="bottom-end" shadow="md" withArrow>
      <Popover.Target>
        <Badge
          component="button"
          color={nRechazadas > 0 ? 'red' : 'yellow'}
          variant="filled"
          style={{ cursor: 'pointer' }}
          aria-label="Estado de sincronización de asistencia"
        >
          {nPendientes > 0 ? `${nPendientes} por sincronizar` : `${nRechazadas} rechazadas`}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          {nPendientes > 0 && (
            <Text size="sm">
              {nPendientes} captura{nPendientes === 1 ? '' : 's'} de asistencia pendiente
              {nPendientes === 1 ? '' : 's'} de sincronizar (se reintenta al recuperar conexión).
            </Text>
          )}
          {nRechazadas > 0 && (
            <>
              <Text size="sm" fw={600} c="red">
                Capturas rechazadas por el servidor:
              </Text>
              {listaRechazadas.map((r, i) => (
                <Text key={`${r.cursoId}-${r.fecha}-${i}`} size="xs">
                  {r.fecha} · {r.registros.length} registro{r.registros.length === 1 ? '' : 's'} — {r.motivo}
                </Text>
              ))}
              <Button size="xs" color="red" variant="light" onClick={limpiarRechazadas}>
                Descartar rechazadas
              </Button>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
