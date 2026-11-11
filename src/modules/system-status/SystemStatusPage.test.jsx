import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SystemStatusPage from './SystemStatusPage.jsx';

function jsonResponse(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null;
      },
    },
    async json() {
      return body;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SystemStatusPage', () => {
  it('muestra el estado del backend cuando la API responde', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        status: 'ok',
        service: 'zona-lab-api',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<SystemStatusPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Verificando conexión');
    expect(await screen.findByText('Backend operativo.')).toBeInTheDocument();
    expect(screen.getByText('zona-lab-api')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('permite reintentar después de un error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'El servicio no está disponible.',
            },
          },
          { status: 500 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: 'ok',
          service: 'zona-lab-api',
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<SystemStatusPage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('El servicio no está disponible.');

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Backend operativo.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
