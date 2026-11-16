import { request } from '../../shared/api/http-client.js';

export function sendContactMessage(payload) {
  return request('/contact', {
    method: 'POST',
    body: payload,
  });
}
