import { useEffect } from 'react';

export const MENSAJE_DIRTY = 'Hay cambios sin guardar. ¿Salir y descartarlos?';

// FB-F-13: guard de cambios sin guardar. La app usa <BrowserRouter> (sin data router), por lo
// que useBlocker de react-router no está disponible; se cubre la superficie real de navegación:
// - beforeunload: recarga / cierre de pestaña / URL manual.
// - clic en anclas internas (toda la navegación SPA de la app ocurre vía <Link> ⇒ <a href="/...">):
//   se intercepta en fase de captura y se pide confirmación antes de dejar navegar.
export function useDirtyGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const alDescargar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const alClicCaptura = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const ancla = (e.target as Element | null)?.closest?.('a[href]');
      const href = ancla?.getAttribute('href');
      if (!href || !href.startsWith('/')) return;
      if (!window.confirm(MENSAJE_DIRTY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', alDescargar);
    document.addEventListener('click', alClicCaptura, true);
    return () => {
      window.removeEventListener('beforeunload', alDescargar);
      document.removeEventListener('click', alClicCaptura, true);
    };
  }, [dirty]);
}
