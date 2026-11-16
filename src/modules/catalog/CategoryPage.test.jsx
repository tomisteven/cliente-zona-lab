import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CategoryPage from './CategoryPage.jsx';
import { listCatalogProducts } from './catalog.api.js';

vi.mock('./catalog.api.js', () => ({
  listCatalogProducts: vi.fn(),
}));

const PRODUCT = {
  id: 'p1',
  name: 'Paletero Pro',
  slug: 'paletero-pro',
  category: 'paleteros',
  categoryLabel: 'Paleteros',
  shortDescription: 'Paletero térmico para entrenamiento.',
  imageUrl: '',
  minimumQuantity: 10,
  startingUnitPrice: 7600,
};

function renderCategory(path = '/catalogo/paleteros') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalogo/:categoria" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CategoryPage', () => {
  beforeEach(() => {
    listCatalogProducts.mockResolvedValue({
      items: [PRODUCT],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
  });

  it('muestra la landing de categoría con sus productos', async () => {
    renderCategory();

    expect(
      await screen.findByRole('heading', { name: /Paleteros personalizados/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Paletero Pro')).toBeInTheDocument();
    expect(listCatalogProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'paleteros', page: 1 }),
    );
  });

  it('muestra una salida segura para categorías inexistentes', async () => {
    renderCategory('/catalogo/no-existe');

    expect(await screen.findByText('No encontramos esa categoría.')).toBeInTheDocument();
  });
});
