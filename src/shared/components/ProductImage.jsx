import { resolveMediaUrl } from '../api/http-client.js';
import { DEFAULT_IMAGE_SIZES, resolveMediaSrcSet } from '../api/media.js';

export default function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = DEFAULT_IMAGE_SIZES,
}) {
  const resolvedSrc = resolveMediaUrl(src);
  const srcSet = resolveMediaSrcSet(src, resolveMediaUrl);

  if (!resolvedSrc) {
    return (
      <span
        className={`product-image product-image--placeholder ${className}`}
        role="img"
        aria-label={alt}
      >
        <span>ZL</span>
      </span>
    );
  }

  return (
    <img
      className={`product-image ${className}`}
      src={resolvedSrc}
      srcSet={srcSet ?? undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={1200}
      height={900}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}
