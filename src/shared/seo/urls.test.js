import { afterEach, describe, expect, it, vi } from 'vitest';

import { absoluteUrl, getSiteUrl } from './urls.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('SEO urls', () => {
  it('usa el origen actual cuando no hay dominio configurado', () => {
    expect(getSiteUrl()).toBe(window.location.origin);
    expect(absoluteUrl('/catalogo')).toBe(`${window.location.origin}/catalogo`);
  });

  it('prioriza VITE_SITE_URL sin barra final', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://www.zonalab.test/');

    expect(getSiteUrl()).toBe('https://www.zonalab.test');
    expect(absoluteUrl('/productos/bolso')).toBe('https://www.zonalab.test/productos/bolso');
  });

  it('deja intactas las URLs absolutas', () => {
    expect(absoluteUrl('https://cdn.example.com/imagen.jpg', 'https://www.zonalab.test')).toBe(
      'https://cdn.example.com/imagen.jpg',
    );
  });
});
