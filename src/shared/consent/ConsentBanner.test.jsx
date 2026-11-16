import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import ConsentBanner from './ConsentBanner.jsx';
import { ConsentProvider } from './ConsentProvider.jsx';

function renderConsent() {
  return render(
    <MemoryRouter>
      <ConsentProvider>
        <ConsentBanner />
      </ConsentProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('ConsentBanner', () => {
  it('guarda la aceptación total', () => {
    renderConsent();

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar todo' }));

    expect(JSON.parse(window.localStorage.getItem('zl_cookie_consent'))).toMatchObject({
      analytics: true,
      marketing: true,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('permite aceptar solo las necesarias', () => {
    renderConsent();

    fireEvent.click(screen.getByRole('button', { name: 'Solo necesarias' }));

    expect(JSON.parse(window.localStorage.getItem('zl_cookie_consent'))).toMatchObject({
      analytics: false,
      marketing: false,
    });
  });
});
