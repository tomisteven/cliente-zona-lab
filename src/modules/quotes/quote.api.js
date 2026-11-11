import { request } from '../../shared/api/http-client.js';

export function estimateQuote(payload, { signal } = {}) {
  return request('/quotes/estimate', {
    method: 'POST',
    body: payload,
    signal,
  });
}

export function createQuoteRequest(formData) {
  return request('/quotes', {
    method: 'POST',
    body: formData,
  });
}
