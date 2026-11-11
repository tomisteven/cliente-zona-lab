import { adminRequest, getApiUrl, request } from '../../shared/api/http-client.js';

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

export function loginAdmin(credentials) {
  return request('/admin/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function getAdminSession() {
  return adminRequest('/admin/auth/session');
}

export function logoutAdmin() {
  return adminRequest('/admin/auth/logout', { method: 'POST' });
}

export function listAdminProducts({ page = 1, limit = 20, category, search, signal } = {}) {
  return adminRequest(`/admin/products${buildQuery({ page, limit, category, search })}`, {
    signal,
  });
}

export function getAdminProduct(id, { signal } = {}) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}`, { signal });
}

export function createAdminProduct(payload) {
  return adminRequest('/admin/products', {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminProduct(id, payload) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload,
  });
}

export function setAdminProductStatus(id, active) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { active },
  });
}

export function deleteAdminProduct(id) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function uploadAdminMedia(file) {
  const formData = new FormData();
  formData.set('file', file, file.name);

  return adminRequest('/admin/uploads/media', {
    method: 'POST',
    body: formData,
  });
}

export function listAdminQuotes({ page = 1, limit = 20, search, signal } = {}) {
  return adminRequest(`/admin/quotes${buildQuery({ page, limit, search })}`, { signal });
}

export function getAdminQuoteFileUrl(quoteId, kind) {
  return getApiUrl(`/admin/quotes/${encodeURIComponent(quoteId)}/files/${kind}`);
}

export function getAdminSettings({ signal } = {}) {
  return adminRequest('/admin/settings', { signal });
}

export function updateAdminSettings(payload) {
  return adminRequest('/admin/settings', {
    method: 'PUT',
    body: payload,
  });
}
