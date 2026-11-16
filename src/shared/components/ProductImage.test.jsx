import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProductImage from './ProductImage.jsx';

describe('ProductImage', () => {
  it('agrega srcset y sizes para imágenes locales', () => {
    render(<ProductImage src="/uploads/media/bolso.png" alt="Bolso" />);

    const image = screen.getByRole('img', { name: 'Bolso' });

    expect(image.getAttribute('srcset')).toContain('/uploads/media/bolso.png?w=480 480w');
    expect(image.getAttribute('srcset')).toContain('/uploads/media/bolso.png?w=1600 1600w');
    expect(image.getAttribute('sizes')).toContain('max-width: 640px');
  });

  it('respeta sizes personalizados y no agrega srcset a URLs externas', () => {
    render(
      <ProductImage src="https://cdn.example.com/bolso.png" alt="Bolso externo" sizes="96px" />,
    );

    const image = screen.getByRole('img', { name: 'Bolso externo' });

    expect(image.getAttribute('srcset')).toBeNull();
    expect(image.getAttribute('sizes')).toBeNull();
    expect(image.getAttribute('src')).toBe('https://cdn.example.com/bolso.png');
  });

  it('muestra el placeholder sin imagen', () => {
    render(<ProductImage src="" alt="Sin imagen" />);

    expect(screen.getByRole('img', { name: 'Sin imagen' })).toHaveClass(
      'product-image--placeholder',
    );
  });
});
