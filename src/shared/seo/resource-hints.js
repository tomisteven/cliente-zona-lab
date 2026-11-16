function appendLink(rel, href) {
  if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
    return;
  }

  const link = document.createElement('link');

  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
}

export function installResourceHints() {
  const origins = new Set();

  for (const value of [import.meta.env.VITE_API_BASE_URL, import.meta.env.VITE_MEDIA_BASE_URL]) {
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value, window.location.origin);

      if (url.origin !== window.location.origin) {
        origins.add(url.origin);
      }
    } catch {
      continue;
    }
  }

  for (const origin of origins) {
    appendLink('preconnect', origin);
    appendLink('dns-prefetch', origin);
  }
}
