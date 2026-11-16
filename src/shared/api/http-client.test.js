import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, adminRequest, getApiUrl, request, resolveMediaUrl } from './http-client.js';

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

function clearCsrfCookie() {
  document.cookie = 'zl_admin_csrf=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  clearCsrfCookie();
});

describe('getApiUrl', () => {
  it('usa la ruta relativa por defecto', () => {
    expect(getApiUrl('/health')).toBe('/api/health');
  });

  it('usa la API configurada sin barra final', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/api/');

    expect(getApiUrl('/catalog/products')).toBe('https://api.example.com/api/catalog/products');
  });
});

describe('resolveMediaUrl', () => {
  it('mantiene las rutas locales por defecto', () => {
    expect(resolveMediaUrl('/uploads/media/producto.webp')).toBe('/uploads/media/producto.webp');
  });

  it('deriva el origen de la API para las imágenes', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/api');

    expect(resolveMediaUrl('/uploads/media/producto.webp')).toBe(
      'https://api.example.com/uploads/media/producto.webp',
    );
  });

  it('prioriza el origen de media configurado', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/api');
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://cdn.example.com/');

    expect(resolveMediaUrl('/uploads/media/producto.webp')).toBe(
      'https://cdn.example.com/uploads/media/producto.webp',
    );
  });

  it('no modifica URLs absolutas ni valores vacíos', () => {
    expect(resolveMediaUrl('https://cdn.example.com/producto.webp')).toBe(
      'https://cdn.example.com/producto.webp',
    );
    expect(resolveMediaUrl('')).toBe('');
  });
});

describe('request', () => {
  it('envía JSON con credenciales y devuelve el cuerpo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));

    vi.stubGlobal('fetch', fetchMock);

    const body = await request('/quotes/estimate', {
      method: 'POST',
      body: { quantity: 10 },
    });
    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe('/api/quotes/estimate');
    expect(options.credentials).toBe('include');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ quantity: 10 });
    expect(body).toEqual({ ok: true });
  });

  it('no fuerza JSON cuando el cuerpo es FormData', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));

    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();

    formData.set('payload', '{}');

    await request('/quotes', { method: 'POST', body: formData });

    const [, options] = fetchMock.mock.calls[0];

    expect(options.body).toBe(formData);
    expect(options.headers).not.toHaveProperty('Content-Type');
  });

  it('traduce el contrato de error a ApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Revisá los datos enviados.',
            details: [{ field: 'quantity', message: 'Inválida.' }],
          },
        },
        { status: 400 },
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/quotes/estimate')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Revisá los datos enviados.',
      details: [{ field: 'quantity', message: 'Inválida.' }],
    });
  });

  it('convierte fallas de red en ApiError sin exponer detalles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));

    await expect(request('/health')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      code: 'REQUEST_FAILED',
    });
  });
});

describe('adminRequest', () => {
  it('adjunta el token CSRF de la cookie', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [] }));

    document.cookie = 'zl_admin_csrf=token-de-prueba; path=/';
    vi.stubGlobal('fetch', fetchMock);

    await adminRequest('/admin/products');

    expect(fetchMock.mock.calls[0][1].headers['x-csrf-token']).toBe('token-de-prueba');
  });

  it('emite admin:unauthorized ante un 401 en rutas admin', async () => {
    const handler = vi.fn();

    window.addEventListener('admin:unauthorized', handler);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: { code: 'AUTH_REQUIRED', message: 'Iniciá sesión.' },
          },
          { status: 401 },
        ),
      ),
    );

    await expect(adminRequest('/admin/products')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener('admin:unauthorized', handler);
  });

  it('no emite admin:unauthorized en el login', async () => {
    const handler = vi.fn();

    window.addEventListener('admin:unauthorized', handler);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' },
          },
          { status: 401 },
        ),
      ),
    );

    await expect(
      request('/admin/auth/login', { method: 'POST', body: { email: 'a', password: 'b' } }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();

    window.removeEventListener('admin:unauthorized', handler);
  });
});
