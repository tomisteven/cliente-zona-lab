import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductDetailPage from './ProductDetailPage.jsx';
import { getCatalogProduct, listCatalogProducts } from './catalog.api.js';
import { createProductReview, listProductReviews } from '../reviews/review.api.js';

vi.mock('./catalog.api.js', () => ({
  getCatalogProduct: vi.fn(),
  listCatalogProducts: vi.fn(),
}));

vi.mock('../reviews/review.api.js', () => ({
  listProductReviews: vi.fn(),
  createProductReview: vi.fn(),
}));

const PRODUCT = {
  id: 'product-1',
  name: 'Bolso Urbano',
  slug: 'bolso-urbano',
  category: 'bolsos',
  categoryLabel: 'Bolsos',
  shortDescription: 'Bolso para todos los días.',
  description: 'Descripción completa.',
  features: ['Cierre reforzado'],
  imageUrl: '',
  images: [],
  imageAlt: '',
  minimumQuantity: 10,
  startingUnitPrice: 10000,
  personalizationFee: 0,
  priceTiers: [{ minQuantity: 10, maxQuantity: null, unitPrice: 10000 }],
  optionGroups: [],
};

const REVIEW = {
  id: 'review-1',
  name: 'Ana',
  rating: 5,
  comment: 'Muy buena calidad.',
  createdAt: '2026-11-12T12:00:00.000Z',
};

describe('ProductDetailPage reviews', () => {
  beforeEach(() => {
    getCatalogProduct.mockResolvedValue({ product: PRODUCT });
    listCatalogProducts.mockResolvedValue({ items: [], pagination: null });
    listProductReviews.mockResolvedValue({
      items: [REVIEW],
      summary: { count: 1, average: 5 },
    });
    createProductReview.mockResolvedValue({ published: false });
  });

  it('muestra reseñas y permite enviar una nueva', async () => {
    render(
      <MemoryRouter initialEntries={['/productos/bolso-urbano']}>
        <Routes>
          <Route path="/productos/:slug" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Bolso Urbano' })).toBeInTheDocument();
    expect(await screen.findByText('Muy buena calidad.')).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre *'), {
      target: { value: 'Cliente Nuevo' },
    });
    fireEvent.change(screen.getByLabelText('Comentario *'), {
      target: { value: 'Quiero dejar mi opinión sobre el producto.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar reseña/i }));

    await waitFor(() => {
      expect(createProductReview).toHaveBeenCalledWith('product-1', {
        name: 'Cliente Nuevo',
        rating: 5,
        comment: 'Quiero dejar mi opinión sobre el producto.',
      });
    });
    expect(
      await screen.findByText('Recibimos tu reseña. Se publicará después de la moderación.'),
    ).toBeInTheDocument();
  });
});
