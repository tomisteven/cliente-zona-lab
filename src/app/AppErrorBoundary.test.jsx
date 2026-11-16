import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AppErrorBoundary from './AppErrorBoundary.jsx';

function BrokenComponent() {
  throw new Error('Falla de prueba');
}

describe('AppErrorBoundary', () => {
  it('muestra una salida segura cuando un componente falla', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal.');
    expect(screen.getByRole('button', { name: /Recargar la página/i })).toBeInTheDocument();
  });
});
