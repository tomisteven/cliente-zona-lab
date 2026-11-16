import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CatalogPage from './CatalogPage.jsx';
import { listCatalogProducts } from './catalog.api.js';

vi.mock('./catalog.api.js', () => ({
  listCatalogProducts: vi.fn(),
}));

const PRODUCT = {
  id: 'p1',
  name: 'Bolso Urbano',
  slug: 'bolso-urbano',
  category: 'bolsos',
  categoryLabel: 'Bolsos',
  shortDescription: 'Bolso para todos los días.',
  imageUrl: '',
  minimumQuantity: 10,
  startingUnitPrice: 10000,
};

describe('CatalogPage', () => {
  beforeEach(() => {
    listCatalogProducts.mockResolvedValue({
      items: [PRODUCT],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
  });

  it('muestra los productos y navega a la landing de categoría', async () => {
    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <Routes>
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:categoria" element={<p>Categoría destino</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Bolso Urbano')).toBeInTheDocument();
    expect(screen.getByText(/1 producto encontrado/i)).toBeInTheDocument();

    const mochilasButton = screen.getByRole('button', { name: 'Mochilas' });

    expect(mochilasButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(mochilasButton);

    expect(await screen.findByText('Categoría destino')).toBeInTheDocument();
  });

  it('muestra el estado de error con opción de reintento', async () => {
    listCatalogProducts.mockRejectedValueOnce(new Error('Sin conexión.'));

    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <Routes>
          <Route path="/catalogo" element={<CatalogPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el catálogo.');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
