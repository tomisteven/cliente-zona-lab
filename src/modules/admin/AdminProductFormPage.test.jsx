import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminProductFormPage from './AdminProductFormPage.jsx';
import { createAdminProduct, getAdminProduct, updateAdminProduct } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  createAdminProduct: vi.fn(),
  getAdminProduct: vi.fn(),
  updateAdminProduct: vi.fn(),
  uploadAdminMedia: vi.fn(),
  listAdminMedia: vi.fn(),
  listAdminProducts: vi.fn(),
  setAdminProductStatus: vi.fn(),
  deleteAdminProduct: vi.fn(),
  listAdminQuotes: vi.fn(),
  getAdminQuoteFileUrl: vi.fn(),
  getAdminSettings: vi.fn(),
  updateAdminSettings: vi.fn(),
  loginAdmin: vi.fn(),
  getAdminSession: vi.fn(),
  logoutAdmin: vi.fn(),
}));

const PRODUCT = {
  id: 'p1',
  name: 'Bolso Original',
  slug: 'bolso-original',
  category: 'bolsos',
  categoryLabel: 'Bolsos',
  shortDescription: 'Un bolso original.',
  description: 'Descripción completa.',
  features: ['Cierre reforzado'],
  imageUrl: '',
  active: true,
  minimumQuantity: 10,
  personalizationFee: 1000,
  priceTiers: [{ minQuantity: 10, maxQuantity: null, unitPrice: 10000 }],
  optionGroups: [
    {
      id: 'g1',
      name: 'Color',
      required: true,
      choices: [
        { id: 'c1', label: 'Negro', additionalUnitPrice: 0 },
        { id: 'c2', label: 'Blanco', additionalUnitPrice: 500 },
      ],
    },
  ],
};

function renderForm(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/productos/nuevo" element={<AdminProductFormPage />} />
        <Route path="/admin/productos/:id" element={<AdminProductFormPage />} />
        <Route path="/admin/productos" element={<p>Listado listo</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminProductFormPage', () => {
  beforeEach(() => {
    createAdminProduct.mockResolvedValue({ product: { id: 'p2' } });
    updateAdminProduct.mockResolvedValue({ product: PRODUCT });
    getAdminProduct.mockResolvedValue({ product: PRODUCT });
  });

  it('crea un producto con los valores del formulario', async () => {
    renderForm('/admin/productos/nuevo');

    fireEvent.change(screen.getByLabelText('Nombre *'), {
      target: { value: 'Bolso Test' },
    });
    fireEvent.change(screen.getByLabelText('Descripción breve *'), {
      target: { value: 'Un bolso de prueba.' },
    });
    fireEvent.change(screen.getByLabelText('Precio unitario *'), {
      target: { value: '12500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Crear producto/i }));

    await waitFor(() => {
      expect(createAdminProduct).toHaveBeenCalledTimes(1);
    });

    expect(createAdminProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bolso Test',
        shortDescription: 'Un bolso de prueba.',
        category: 'bolsos-deportivos',
        features: [],
        priceTiers: [{ minQuantity: 12, maxQuantity: null, unitPrice: 12500 }],
        optionGroups: [],
      }),
    );
    expect(await screen.findByText('Listado listo')).toBeInTheDocument();
  });

  it('edita un producto existente', async () => {
    renderForm('/admin/productos/p1');

    const nameInput = await screen.findByDisplayValue('Bolso Original');

    expect(screen.getByDisplayValue('bolso-original')).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Bolso Editado' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(updateAdminProduct).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ name: 'Bolso Editado' }),
      );
    });
    expect(await screen.findByText('Listado listo')).toBeInTheDocument();
  });
});
