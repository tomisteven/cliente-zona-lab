import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ContactPage from './ContactPage.jsx';
import { sendContactMessage } from './contact.api.js';

vi.mock('./contact.api.js', () => ({
  sendContactMessage: vi.fn(),
}));

describe('ContactPage', () => {
  beforeEach(() => {
    sendContactMessage.mockResolvedValue({ sent: true });
  });

  it('envía la consulta y muestra confirmación', async () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nombre y apellido/i), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Consulta/i), {
      target: { value: 'Quiero cotizar 50 mochilas personalizadas.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/i }));

    await waitFor(() => {
      expect(sendContactMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ana Pérez',
          email: 'ana@example.com',
        }),
      );
    });
    expect(
      await screen.findByText('Recibimos tu consulta. Te vamos a responder a la brevedad.'),
    ).toBeInTheDocument();
  });
});
