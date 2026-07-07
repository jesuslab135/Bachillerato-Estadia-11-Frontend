import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDirtyGuard } from './useDirtyGuard';

function Sujeto({ dirty, onNavega }: { dirty: boolean; onNavega: () => void }) {
  useDirtyGuard(dirty);
  return (
    <a href="/otra-ruta" onClick={(e) => { e.preventDefault(); onNavega(); }}>
      Ir a otra ruta
    </a>
  );
}

afterEach(() => vi.restoreAllMocks());

describe('useDirtyGuard (FB-F-13)', () => {
  it('bloquea el clic en enlaces internos cuando hay cambios y el usuario cancela', async () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onNavega = vi.fn();
    render(<Sujeto dirty onNavega={onNavega} />);
    await userEvent.click(screen.getByText('Ir a otra ruta'));
    expect(confirmar).toHaveBeenCalledOnce();
    expect(onNavega).not.toHaveBeenCalled();
  });

  it('deja navegar cuando el usuario confirma', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onNavega = vi.fn();
    render(<Sujeto dirty onNavega={onNavega} />);
    await userEvent.click(screen.getByText('Ir a otra ruta'));
    expect(onNavega).toHaveBeenCalledOnce();
  });

  it('no interfiere cuando no hay cambios', async () => {
    const confirmar = vi.spyOn(window, 'confirm');
    const onNavega = vi.fn();
    render(<Sujeto dirty={false} onNavega={onNavega} />);
    await userEvent.click(screen.getByText('Ir a otra ruta'));
    expect(confirmar).not.toHaveBeenCalled();
    expect(onNavega).toHaveBeenCalledOnce();
  });
});
