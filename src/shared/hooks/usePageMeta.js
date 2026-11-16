import { useEffect } from 'react';

import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME } from '../seo/site.js';
import { absoluteUrl } from '../seo/urls.js';

const MANAGED_ATTRIBUTE = 'data-seo-managed';

function claimMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector(selector);
  const created = !existing;
  const meta = existing ?? document.createElement('meta');
  const previousContent = created ? null : meta.getAttribute('content');
  const wasManaged = created ? true : meta.hasAttribute(MANAGED_ATTRIBUTE);

  if (created) {
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute(MANAGED_ATTRIBUTE, 'true');
  meta.setAttribute('content', content);

  return () => {
    if (created) {
      meta.remove();
      return;
    }

    if (previousContent === null) {
      meta.removeAttribute('content');
    } else {
      meta.setAttribute('content', previousContent);
    }

    if (!wasManaged) {
      meta.removeAttribute(MANAGED_ATTRIBUTE);
    }
  };
}

function claimCanonical(url) {
  const existing = document.head.querySelector('link[rel="canonical"]');
  const created = !existing;
  const link = existing ?? document.createElement('link');

  if (created) {
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  const previousHref = created ? null : link.getAttribute('href');

  link.setAttribute('href', url);

  return () => {
    if (created) {
      link.remove();
      return;
    }

    if (previousHref === null) {
      link.removeAttribute('href');
    } else {
      link.setAttribute('href', previousHref);
    }
  };
}

function injectJsonLd(jsonLd) {
  const existingScripts = [
    ...document.head.querySelectorAll('script[data-seo-jsonld], script[data-seo-static]'),
  ];

  existingScripts.forEach((script) => script.remove());

  if (!jsonLd) {
    return () => {};
  }

  const scripts = [];

  for (const item of Array.isArray(jsonLd) ? jsonLd : [jsonLd]) {
    const script = document.createElement('script');

    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
    scripts.push(script);
  }

  return () => {
    scripts.forEach((script) => script.remove());
  };
}

export function usePageMeta(title, description, options = {}) {
  const { path, image, type = 'website', robots = 'index,follow', jsonLd } = options;
  const jsonLdValue = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const previousTitle = document.title;
    const finalTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    const finalDescription = description?.trim() || DEFAULT_DESCRIPTION;
    const canonical = absoluteUrl(path || window.location.pathname);
    const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);
    const cleanups = [];

    document.title = finalTitle;
    cleanups.push(claimMeta('name', 'description', finalDescription));
    cleanups.push(claimMeta('name', 'robots', robots));
    cleanups.push(claimMeta('property', 'og:title', finalTitle));
    cleanups.push(claimMeta('property', 'og:description', finalDescription));
    cleanups.push(claimMeta('property', 'og:type', type));
    cleanups.push(claimMeta('property', 'og:url', canonical));
    cleanups.push(claimMeta('property', 'og:site_name', SITE_NAME));
    cleanups.push(claimMeta('property', 'og:locale', 'es_AR'));
    cleanups.push(claimMeta('property', 'og:image', imageUrl));
    cleanups.push(claimMeta('property', 'og:image:alt', finalTitle));
    cleanups.push(claimMeta('name', 'twitter:card', 'summary_large_image'));
    cleanups.push(claimMeta('name', 'twitter:title', finalTitle));
    cleanups.push(claimMeta('name', 'twitter:description', finalDescription));
    cleanups.push(claimMeta('name', 'twitter:image', imageUrl));
    cleanups.push(claimMeta('name', 'twitter:image:alt', finalTitle));
    cleanups.push(claimCanonical(canonical));

    if (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION) {
      cleanups.push(
        claimMeta(
          'name',
          'google-site-verification',
          import.meta.env.VITE_GOOGLE_SITE_VERIFICATION,
        ),
      );
    }

    if (import.meta.env.VITE_BING_SITE_VERIFICATION) {
      cleanups.push(
        claimMeta('name', 'msvalidate.01', import.meta.env.VITE_BING_SITE_VERIFICATION),
      );
    }

    const removeJsonLd = injectJsonLd(jsonLdValue ? JSON.parse(jsonLdValue) : null);

    return () => {
      document.title = previousTitle;
      removeJsonLd();

      for (const cleanup of cleanups.reverse()) {
        cleanup();
      }
    };
  }, [title, description, path, image, type, robots, jsonLdValue]);
}
