import { afterEach, describe, expect, it, vi } from 'vitest';

import { getApiUrl, resolveMediaUrl } from './http-client.js';

afterEach(() => {
  vi.unstubAllEnvs();
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
