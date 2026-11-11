import { request } from '../../shared/api/http-client.js';

export function getPublicSettings({ signal } = {}) {
  return request('/settings/public', { signal });
}
