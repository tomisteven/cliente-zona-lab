import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCatalogProduct, listCatalogProducts } from '../catalog/catalog.api.js';
import QuoteWizardPage from './QuoteWizardPage.jsx';
import { createQuoteRequest, estimateQuote } from './quote.api.js';

vi.mock('../catalog/catalog.api.js', () => ({
  listCatalogProducts: vi.fn(),
  getCatalogProduct: vi.fn(),
}));

vi.mock('./quote.api.js', () => ({
  estimateQuote: vi.fn(),
  createQuoteRequest: vi.fn(),
}));

const SUMMARY = {
  id: 'product-1',
  name: 'Bolso Urbano',
  slug: 'bolso-urbano',
  categoryLabel: 'Bolsos',
  shortDescription: 'Bolso con cierre y correa ajustable.',
  imageUrl: '',
  minimumQuantity: 10,
  startingUnitPrice: 10000,
};

const PRODUCT = {
  ...SUMMARY,
  description: 'Una pieza para uso diario.',
  features: ['Cierre reforzado'],
  personalizationFee: 1000,
  priceTiers: [{ minQuantity: 10, maxQuantity: null, unitPrice: 10000 }],
  optionGroups: [
    {
      id: 'group-color',
      name: 'Color',
      required: true,
      choices: [
        { id: 'choice-black', label: 'Negro', additionalUnitPrice: 0 },
        { id: 'choice-white', label: 'Blanco', additionalUnitPrice: 500 },
      ],
    },
  ],
};

const ESTIMATE = {
  product: { id: PRODUCT.id, name: PRODUCT.name, slug: PRODUCT.slug, minimumQuantity: 10 },
  quantity: 10,
  selections: [],
  pricing: {
    status: 'estimated',
    unitBasePrice: 10000,
    optionsUnitTotal: 0,
    unitPrice: 10000,
    personalizationFee: 1000,
    estimatedTotal: 101000,
    currency: 'ARS',
  },
};

const CREATED_QUOTE = {
  quote: {
    id: 'quote-1',
    code: 'ZL-20261022-ABC123',
    product: { id: PRODUCT.id, name: PRODUCT.name, slug: PRODUCT.slug },
    quantity: 10,
    pricing: ESTIMATE.pricing,
    files: { logo: false, reference: false },
  },
  whatsappUrl: 'https://wa.me/5491112345678?text=pedido',
};

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/personalizar']}>
      <Routes>
        <Route path="/personalizar" element={<QuoteWizardPage />} />
        <Route path="/personalizar/:slug" element={<QuoteWizardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('QuoteWizardPage', () => {
  beforeEach(() => {
    listCatalogProducts.mockResolvedValue({
      items: [SUMMARY],
      pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
    });
    getCatalogProduct.mockResolvedValue({ product: PRODUCT });
    estimateQuote.mockResolvedValue({ estimate: ESTIMATE });
    createQuoteRequest.mockResolvedValue(CREATED_QUOTE);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockReturnValue({
      closed: false,
      opener: null,
      location: { href: '' },
    });
  });

  it('completa el flujo de cotización y registra el pedido', async () => {
    renderWizard();

    fireEvent.click(await screen.findByRole('button', { name: /Elegir/i }));

    expect(
      await screen.findByRole('heading', { name: /Personalizá tu bolso urbano/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Negro/i })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /Continuar con la cantidad/i }));

    expect(await screen.findByText('Total estimado', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/101[.\s]000/)).toBeInTheDocument();
    expect(estimateQuote).toHaveBeenCalledWith(
      {
        productId: PRODUCT.id,
        quantity: 10,
        selections: [{ groupId: 'group-color', choiceId: 'choice-black' }],
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Continuar con mis datos/i }));

    expect(await screen.findByRole('heading', { name: /Revisá el pedido/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre y apellido/i), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '11 5555 4444' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y abrir WhatsApp/i }));

    expect(
      await screen.findByRole('heading', { name: /Tu cotización está lista para enviar/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(CREATED_QUOTE.quote.code)).toBeInTheDocument();
    expect(createQuoteRequest).toHaveBeenCalledTimes(1);

    const formData = createQuoteRequest.mock.calls[0][0];
    const payload = JSON.parse(formData.get('payload'));

    expect(payload.customer.name).toBe('Ana Pérez');
    expect(payload.productId).toBe(PRODUCT.id);
    expect(payload.quantity).toBe(10);
  });

  it('muestra un error de validación si falta el teléfono', async () => {
    renderWizard();

    fireEvent.click(await screen.findByRole('button', { name: /Elegir/i }));
    await screen.findByRole('heading', { name: /Personalizá tu bolso urbano/i });
    fireEvent.click(screen.getByRole('button', { name: /Continuar con la cantidad/i }));
    await screen.findByText('Total estimado', {}, { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: /Continuar con mis datos/i }));
    await screen.findByRole('heading', { name: /Revisá el pedido/i });

    fireEvent.change(screen.getByLabelText(/Nombre y apellido/i), {
      target: { value: 'Ana Pérez' },
    });

    const form = document.getElementById('quote-review-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Ingresá un teléfono de contacto válido.')).toBeInTheDocument();
    });
    expect(createQuoteRequest).not.toHaveBeenCalled();
  });
});
