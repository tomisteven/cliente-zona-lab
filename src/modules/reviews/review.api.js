import { request } from '../../shared/api/http-client.js';

export function listProductReviews(productId, { signal } = {}) {
  return request(`/catalog/products/${encodeURIComponent(productId)}/reviews`, { signal });
}

export function createProductReview(productId, payload) {
  return request(`/catalog/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST',
    body: payload,
  });
}
