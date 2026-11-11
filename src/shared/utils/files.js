export const DESIGN_FILE_ACCEPT = '.png,.jpg,.jpeg,.webp,.svg,.pdf';
export const MAX_DESIGN_FILE_BYTES = 10 * 1024 * 1024;
export const MEDIA_FILE_ACCEPT = '.png,.jpg,.jpeg,.webp';
export const MAX_MEDIA_FILE_BYTES = 8 * 1024 * 1024;

const MEDIA_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const DESIGN_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);

export function validateDesignFile(file) {
  if (!file) {
    return null;
  }

  if (!DESIGN_MIME_TYPES.has(file.type)) {
    return 'Usá un archivo PNG, JPG, WEBP, SVG o PDF.';
  }

  if (file.size > MAX_DESIGN_FILE_BYTES) {
    return 'El archivo supera los 10 MB.';
  }

  return null;
}

export function validateMediaFile(file) {
  if (!file) {
    return null;
  }

  if (!MEDIA_MIME_TYPES.has(file.type)) {
    return 'Usá una imagen PNG, JPG o WEBP.';
  }

  if (file.size > MAX_MEDIA_FILE_BYTES) {
    return 'La imagen supera los 8 MB.';
  }

  return null;
}

export function isImageFile(file) {
  return Boolean(file && file.type.startsWith('image/'));
}
