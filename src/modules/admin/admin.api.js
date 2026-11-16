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

export function listAdminReviews({ status = 'pending', page = 1, limit = 20, signal } = {}) {
  return adminRequest(`/admin/reviews${buildQuery({ status, page, limit })}`, { signal });
}

export function setAdminReviewApproved(id, approved) {
  return adminRequest(`/admin/reviews/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { approved },
  });
}

export function deleteAdminReview(id) {
  return adminRequest(`/admin/reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getAdminDashboard({ signal } = {}) {
  return adminRequest('/admin/dashboard', { signal });
}

export function listAdminAudit({ page = 1, limit = 30, signal } = {}) {
  return adminRequest(`/admin/audit${buildQuery({ page, limit })}`, { signal });
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

export function listAdminMedia({ search, page = 1, limit = 24, signal } = {}) {
  return adminRequest(`/admin/uploads/media${buildQuery({ search, page, limit })}`, {
    signal,
  });
}

export function listAdminQuotes({ page = 1, limit = 20, search, signal } = {}) {
  return adminRequest(`/admin/quotes${buildQuery({ page, limit, search })}`, { signal });
}

export function getAdminQuotesExportUrl({ search, status } = {}) {
  return getApiUrl(`/admin/quotes/export${buildQuery({ search, status })}`);
}

export function getAdminProductsExportUrl({ category, search } = {}) {
  return getApiUrl(`/admin/products/export${buildQuery({ category, search })}`);
}

export function deleteAdminQuote(id) {
  return adminRequest(`/admin/quotes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function anonymizeAdminQuote(id) {
  return adminRequest(`/admin/quotes/${encodeURIComponent(id)}/anonymize`, {
    method: 'POST',
  });
}

export function updateAdminQuote(id, payload) {
  return adminRequest(`/admin/quotes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function getAdminQuoteFileUrl(quoteId, kind, { inline = false } = {}) {
  const url = getApiUrl(`/admin/quotes/${encodeURIComponent(quoteId)}/files/${kind}`);

  return inline ? `${url}?inline=1` : url;
}

export function deleteAdminMedia(value) {
  if (!value) {
    return Promise.resolve();
  }

  const fileName = String(value).split('/').pop();

  return adminRequest(`/admin/uploads/media/${encodeURIComponent(fileName)}`, {
    method: 'DELETE',
  });
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

export function sendAdminTestEmail() {
  return adminRequest('/admin/settings/test-email', {
    method: 'POST',
  });
}
