import { resolveMediaUrl } from '../api/http-client.js';

export function getSiteUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  const fallback = typeof window !== 'undefined' ? window.location.origin : '';

  return String(configured || fallback).replace(/\/+$/, '');
}

export function absoluteUrl(value, base = getSiteUrl()) {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, `${base}/`).toString();
  } catch {
    return String(value);
  }
}

export function absoluteMediaUrl(value) {
  return absoluteUrl(resolveMediaUrl(value));
}
