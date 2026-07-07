import { QueryClient } from '@tanstack/react-query';

// QueryClient compartido: lo usan el árbol React (main.tsx) y la cola offline
// (invalidación tras sincronizar) — FB-F-11.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
