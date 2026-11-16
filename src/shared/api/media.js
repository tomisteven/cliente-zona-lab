export const MEDIA_VARIANT_WIDTHS = [480, 960, 1600];
export const DEFAULT_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const MEDIA_PATH_PATTERN = /^\/uploads\/media\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpe?g|webp)$/i;
const VARIANT_NAME_PATTERN = /-(?:480|960|1600)\.webp$/i;

export function getMediaVariantUrl(mediaPath, width) {
  const value = String(mediaPath ?? '');

  if (
    !MEDIA_PATH_PATTERN.test(value) ||
    VARIANT_NAME_PATTERN.test(value) ||
    !MEDIA_VARIANT_WIDTHS.includes(width)
  ) {
    return null;
  }

  return `${value}?w=${width}`;
}

export function buildMediaSrcSet(mediaPath) {
  const entries = MEDIA_VARIANT_WIDTHS.map((width) => {
    const variantUrl = getMediaVariantUrl(mediaPath, width);

    return variantUrl ? `${variantUrl} ${width}w` : null;
  });

  return entries.every(Boolean) ? entries.join(', ') : null;
}

export function resolveMediaSrcSet(mediaPath, resolveUrl) {
  const srcSet = buildMediaSrcSet(mediaPath);

  if (!srcSet) {
    return null;
  }

  return srcSet
    .split(', ')
    .map((entry) => {
      const [variantUrl, descriptor] = entry.split(' ');

      return `${resolveUrl(variantUrl)} ${descriptor}`;
    })
    .join(', ');
}
