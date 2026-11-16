import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5050/api';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const catalogResponse = http.get(`${BASE_URL}/catalog/products?limit=12`);

  check(catalogResponse, {
    'catalog 200': (response) => response.status === 200,
  });

  const products = catalogResponse.json('items') ?? [];

  if (products.length > 0) {
    const product = products[0];
    const estimateResponse = http.post(
      `${BASE_URL}/quotes/estimate`,
      JSON.stringify({
        productId: product.id,
        quantity: product.minimumQuantity,
        selections: [],
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    check(estimateResponse, {
      'estimate responds': (response) => [200, 400].includes(response.status),
    });
  }

  sleep(1);
}
