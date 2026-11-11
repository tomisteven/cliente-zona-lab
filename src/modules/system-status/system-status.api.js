import { request } from '../../shared/api/http-client.js';

export function getSystemHealth({ signal } = {}) {
  return request('/health', { signal });
}
