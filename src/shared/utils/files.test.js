import { describe, expect, it } from 'vitest';

import {
  MAX_DESIGN_FILE_BYTES,
  MAX_MEDIA_FILE_BYTES,
  isImageFile,
  validateDesignFile,
  validateMediaFile,
} from './files.js';

describe('validateDesignFile', () => {
  it('acepta los formatos de diseño permitidos', () => {
    expect(validateDesignFile({ type: 'image/png', size: 1024 })).toBeNull();
    expect(validateDesignFile({ type: 'image/jpeg', size: 1024 })).toBeNull();
    expect(validateDesignFile({ type: 'image/webp', size: 1024 })).toBeNull();
    expect(validateDesignFile({ type: 'image/svg+xml', size: 1024 })).toBeNull();
    expect(validateDesignFile({ type: 'application/pdf', size: 1024 })).toBeNull();
    expect(validateDesignFile(null)).toBeNull();
  });

  it('rechaza formatos no permitidos y archivos demasiado grandes', () => {
    expect(validateDesignFile({ type: 'text/plain', size: 100 })).toMatch(/PNG/);
    expect(validateDesignFile({ type: 'image/png', size: MAX_DESIGN_FILE_BYTES + 1 })).toMatch(
      /10 MB/,
    );
  });
});

describe('validateMediaFile', () => {
  it('acepta solo imágenes de media y respeta el límite', () => {
    expect(validateMediaFile({ type: 'image/png', size: 1024 })).toBeNull();
    expect(validateMediaFile({ type: 'image/webp', size: 1024 })).toBeNull();
    expect(validateMediaFile({ type: 'image/svg+xml', size: 1024 })).toMatch(/PNG/);
    expect(validateMediaFile({ type: 'image/png', size: MAX_MEDIA_FILE_BYTES + 1 })).toMatch(
      /8 MB/,
    );
  });

  it('detecta archivos de imagen para la vista previa', () => {
    expect(isImageFile({ type: 'image/png' })).toBe(true);
    expect(isImageFile({ type: 'application/pdf' })).toBe(false);
    expect(isImageFile(null)).toBe(false);
  });
});
