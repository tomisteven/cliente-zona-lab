import { request } from '../../shared/api/http-client.js';

function buildQuery(params) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function listCatalogProducts({ page = 1, limit = 12, category, search, sort, signal } = {}) {
  return request(`/catalog/products${buildQuery({ page, limit, category, search, sort })}`, {
    signal,
  });
}

export function getCatalogProduct(slug, { signal } = {}) {
  return request(`/catalog/products/${encodeURIComponent(slug)}`, { signal });
}
