const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? '';
const GTM_ID = import.meta.env.VITE_GTM_ID ?? '';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '';
const loaded = new Set();

function loadScript(id, src) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');

  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer ?? [];
}

function ensureGtag() {
  ensureDataLayer();
  window.gtag =
    window.gtag ??
    function gtag() {
      window.dataLayer.push(arguments);
    };
}

function ensureFbq() {
  if (typeof window.fbq === 'function') {
    return window.fbq;
  }

  window.fbq = function fbq() {
    window.fbq.queue.push(arguments);
  };
  window.fbq.queue = [];
  window.fbq.loaded = true;
  window.fbq.version = '2.0';

  return window.fbq;
}

export function loadAnalytics({ analytics = false, marketing = false } = {}) {
  if (analytics && GA_ID && !loaded.has('ga')) {
    ensureGtag();
    loadScript('zl-ga', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
    loaded.add('ga');
  }

  if (analytics && GTM_ID && !loaded.has('gtm')) {
    ensureDataLayer();
    window.dataLayer.push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    });
    loadScript('zl-gtm', `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
    loaded.add('gtm');
  }

  if (marketing && META_PIXEL_ID && !loaded.has('meta')) {
    ensureFbq();
    loadScript('zl-meta', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    loaded.add('meta');
  }

  if (!analytics && GA_ID) {
    window[`ga-disable-${GA_ID}`] = true;
  }
}

export function trackPageView(path) {
  const pageLocation = `${window.location.origin}${path}`;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: pageLocation,
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackEvent(name, parameters = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, parameters);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...parameters });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, parameters);
  }
}
