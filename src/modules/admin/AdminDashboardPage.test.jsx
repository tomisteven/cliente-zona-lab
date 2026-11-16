import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminDashboardPage from './AdminDashboardPage.jsx';
import { getAdminDashboard } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  getAdminDashboard: vi.fn(),
}));

const DASHBOARD = {
  metrics: {
    products: { total: 10, active: 9 },
    quotes: {
      total: 4,
      byStatus: { new: 2, contacted: 1, closed: 1 },
      estimatedRevenue: 255000,
    },
  },
  recentQuotes: [
    {
      id: 'q1',
      code: 'ZL-20261112-ABCDEF1234',
      status: 'new',
      createdAt: '2026-11-12T12:00:00.000Z',
      productName: 'Bolso Urbano',
      customerName: 'Ana Pérez',
      pricingStatus: 'estimated',
      estimatedTotal: 100000,
    },
  ],
  topProducts: [{ name: 'Bolso Urbano', quotes: 3 }],
};

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    getAdminDashboard.mockResolvedValue(DASHBOARD);
  });

  it('muestra métricas, pedidos recientes y ranking', async () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Tu operación, de un vistazo.')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('ZL-20261112-ABCDEF1234')).toBeInTheDocument();
    expect(screen.getAllByText('Bolso Urbano').length).toBeGreaterThan(0);
  });
});
