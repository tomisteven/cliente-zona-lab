import { resolveMediaUrl } from '../api/http-client.js';

export default function ProductImage({ src, alt, className = '' }) {
  const resolvedSrc = resolveMediaUrl(src);

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
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
