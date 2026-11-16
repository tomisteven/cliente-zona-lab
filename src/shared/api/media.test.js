import { describe, expect, it } from 'vitest';

import { buildMediaSrcSet, getMediaVariantUrl, resolveMediaSrcSet } from './media.js';

describe('media helpers', () => {
  it('construye URLs de variantes con query para imágenes locales', () => {
    expect(getMediaVariantUrl('/uploads/media/portada.png', 480)).toBe(
      '/uploads/media/portada.png?w=480',
    );
    expect(getMediaVariantUrl('/uploads/media/foto.jpeg', 960)).toBe(
      '/uploads/media/foto.jpeg?w=960',
    );
    expect(getMediaVariantUrl('/uploads/media/foto.webp', 1600)).toBe(
      '/uploads/media/foto.webp?w=1600',
    );
  });

  it('ignora URLs externas, SVG, variantes y anchos inválidos', () => {
    expect(getMediaVariantUrl('https://cdn.example.com/foto.png', 480)).toBeNull();
    expect(getMediaVariantUrl('/uploads/media/logo.svg', 480)).toBeNull();
    expect(getMediaVariantUrl('/uploads/media/foto-480.webp', 480)).toBeNull();
    expect(getMediaVariantUrl('/uploads/media/foto.png', 500)).toBeNull();
    expect(getMediaVariantUrl('', 480)).toBeNull();
  });

  it('genera srcset con los tres anchos', () => {
    expect(buildMediaSrcSet('/uploads/media/portada.png')).toBe(
      '/uploads/media/portada.png?w=480 480w, /uploads/media/portada.png?w=960 960w, /uploads/media/portada.png?w=1600 1600w',
    );
    expect(buildMediaSrcSet('https://cdn.example.com/portada.png')).toBeNull();
  });

  it('resuelve cada variante con el prefijo de media', () => {
    const resolve = (value) => `https://api.example.com${value}`;

    expect(resolveMediaSrcSet('/uploads/media/portada.png', resolve)).toBe(
      'https://api.example.com/uploads/media/portada.png?w=480 480w, https://api.example.com/uploads/media/portada.png?w=960 960w, https://api.example.com/uploads/media/portada.png?w=1600 1600w',
    );
    expect(resolveMediaSrcSet('https://cdn.example.com/portada.png', resolve)).toBeNull();
  });
});
