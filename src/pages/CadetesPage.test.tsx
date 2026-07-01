import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  tokenStore: { get: () => null, set: () => {}, clear: () => {} },
}));

import { api } from '../api/client';
import { CadetesPage } from './CadetesPage';
import { renderConProviders } from '../test/render';

const get = vi.mocked(api.get);

beforeEach(() => {
  get.mockReset();
  get.mockImplementation((url: string) => {
    if (url === '/api/grupos') return Promise.resolve({ data: [{ id: 'G1', nombre: '1A', semestre: 1 }] });
    return Promise.resolve({ data: [] });
  });
});

describe('CadetesPage', () => {
  it('pide seleccionar un grupo antes de gestionar cadetes', async () => {
    renderConProviders(<CadetesPage />);
    expect(await screen.findByText('Selecciona un grupo para gestionar sus cadetes.')).toBeInTheDocument();
  });
});
