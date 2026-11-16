import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePageMeta } from './usePageMeta.js';

function SeoPage() {
  usePageMeta('Producto de prueba', 'Descripción de prueba.', {
    path: '/productos/producto-de-prueba',
    type: 'product',
    image: '/og-default.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Producto de prueba',
    },
  });

  return null;
}

describe('usePageMeta', () => {
  it('actualiza título, metadatos, canonical y JSON-LD', () => {
    const { unmount } = render(<SeoPage />);

    expect(document.title).toBe('Producto de prueba · Zona Lab');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Descripción de prueba.',
    );
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'product',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${window.location.origin}/productos/producto-de-prueba`,
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index,follow',
    );
    expect(document.querySelector('script[data-seo-jsonld]')).toBeInTheDocument();

    unmount();

    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('script[data-seo-jsonld]')).toBeNull();
  });

  it('permite marcar páginas privadas como noindex', () => {
    const { unmount } = render(<PrivatePage />);

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow',
    );

    unmount();
  });
});

function PrivatePage() {
  usePageMeta('Panel', 'Privado.', {
    path: '/admin',
    robots: 'noindex,nofollow',
  });

  return null;
}
