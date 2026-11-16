import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminQuotesPage from './AdminQuotesPage.jsx';
import { listAdminQuotes, updateAdminQuote } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  listAdminQuotes: vi.fn(),
  updateAdminQuote: vi.fn(),
  anonymizeAdminQuote: vi.fn(),
  deleteAdminQuote: vi.fn(),
  getAdminQuotesExportUrl: vi.fn(() => '/api/admin/quotes/export'),
  getAdminQuoteFileUrl: vi.fn(
    (id, kind, { inline = false } = {}) =>
      `/api/admin/quotes/${id}/files/${kind}${inline ? '?inline=1' : ''}`,
  ),
}));

const QUOTE = {
  id: 'quote-1',
  code: 'ZL-20261111-ABCDEF1234',
  status: 'new',
  adminNotes: '',
  createdAt: '2026-11-11T12:00:00.000Z',
  product: { id: 'product-1', name: 'Bolso Urbano', slug: 'bolso-urbano' },
  quantity: 10,
  selections: [],
  designNotes: '',
  customer: {
    name: 'Ana Pérez',
    brandName: '',
    phone: '11 5555 4444',
    email: 'ana@example.com',
    observations: '',
  },
  pricing: {
    status: 'estimated',
    unitPrice: 10000,
    personalizationFee: 0,
    estimatedTotal: 100000,
    currency: 'ARS',
  },
  files: {
    logo: {
      originalName: 'logo.png',
      mimeType: 'image/png',
      sizeBytes: 2048,
      downloadUrl: '/api/admin/quotes/quote-1/files/logo',
    },
    reference: null,
  },
  whatsappUrl: 'https://wa.me/5491112345678?text=pedido',
};

function listResponse(items = [QUOTE]) {
  return {
    items,
    pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  };
}

describe('AdminQuotesPage', () => {
  beforeEach(() => {
    listAdminQuotes.mockResolvedValue(listResponse());
    updateAdminQuote.mockResolvedValue({
      quote: {
        ...QUOTE,
        status: 'contacted',
        adminNotes: 'Llamar mañana.',
      },
    });
  });

  it('actualiza el estado y las notas internas de un pedido', async () => {
    render(<AdminQuotesPage />);

    expect(await screen.findByText(QUOTE.code)).toBeInTheDocument();
    expect(screen.getByAltText('Vista previa de logo')).toHaveAttribute(
      'src',
      '/api/admin/quotes/quote-1/files/logo?inline=1',
    );

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'contacted' },
    });
    fireEvent.change(screen.getByLabelText('Notas internas'), {
      target: { value: 'Llamar mañana.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar seguimiento/i }));

    await waitFor(() => {
      expect(updateAdminQuote).toHaveBeenCalledWith('quote-1', {
        status: 'contacted',
        adminNotes: 'Llamar mañana.',
      });
    });
    expect(await screen.findByText('Pedido actualizado.')).toBeInTheDocument();
  });

  it('filtra los pedidos por estado', async () => {
    render(<AdminQuotesPage />);

    await screen.findByText(QUOTE.code);

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
      target: { value: 'contacted' },
    });

    await waitFor(() => {
      expect(listAdminQuotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'contacted', page: 1 }),
      );
    });
  });
});
