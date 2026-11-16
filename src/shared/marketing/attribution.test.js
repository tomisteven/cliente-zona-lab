import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { captureAttribution, getAttribution } from './attribution.js';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/catalogo');
});

afterEach(() => {
  window.localStorage.clear();
});

describe('attribution', () => {
  it('captura UTM y las conserva para el pedido', () => {
    window.history.replaceState(
      {},
      '',
      '/catalogo?utm_source=google&utm_medium=cpc&utm_campaign=padel-bolsos',
    );

    const attribution = captureAttribution();

    expect(attribution).toMatchObject({
      source: 'google',
      medium: 'cpc',
      campaign: 'padel-bolsos',
      landingPage: '/catalogo?utm_source=google&utm_medium=cpc&utm_campaign=padel-bolsos',
    });
    expect(getAttribution()).toMatchObject({ campaign: 'padel-bolsos' });

    window.history.replaceState({}, '', '/productos/bolso');
    expect(captureAttribution()).toMatchObject({ source: 'google' });
  });

  it('devuelve vacío cuando no hay campaña', () => {
    expect(captureAttribution()).toEqual({});
    expect(getAttribution()).toEqual({});
  });
});
