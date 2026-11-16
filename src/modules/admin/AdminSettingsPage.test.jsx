import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminSettingsPage from './AdminSettingsPage.jsx';
import { getAdminSettings, sendAdminTestEmail, updateAdminSettings } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  getAdminSettings: vi.fn(),
  updateAdminSettings: vi.fn(),
  sendAdminTestEmail: vi.fn(),
  deleteAdminMedia: vi.fn(),
  listAdminMedia: vi.fn(),
}));

const SETTINGS = {
  whatsappNumber: '5491112345678',
  heroTitle: 'Título actual',
  heroSubtitle: 'Subtítulo actual',
  heroImageUrl: '',
  emailNotificationsEnabled: false,
  notificationEmail: '',
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  hasSmtpAppPassword: false,
};

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    getAdminSettings.mockResolvedValue({ settings: SETTINGS });
    updateAdminSettings.mockResolvedValue({
      settings: {
        ...SETTINGS,
        emailNotificationsEnabled: true,
        notificationEmail: 'pedidos@zonalab.test',
        smtpHost: 'smtp.zonalab.test',
        smtpUser: 'notificador@zonalab.test',
        hasSmtpAppPassword: true,
      },
    });
    sendAdminTestEmail.mockResolvedValue({ sent: true });
  });

  it('guarda la configuración SMTP con contraseña de aplicación', async () => {
    render(<AdminSettingsPage />);

    expect(await screen.findByRole('heading', { name: 'Configuración' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Correo de destino/i), {
      target: { value: 'pedidos@zonalab.test' },
    });
    fireEvent.change(screen.getByLabelText(/Usuario SMTP/i), {
      target: { value: 'notificador@zonalab.test' },
    });
    fireEvent.change(screen.getByLabelText(/Servidor SMTP/i), {
      target: { value: 'smtp.zonalab.test' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña de aplicación/i), {
      target: { value: 'app-password-secreta' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Activar notificaciones/i }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar configuración/i }));

    await waitFor(() => {
      expect(updateAdminSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          emailNotificationsEnabled: true,
          notificationEmail: 'pedidos@zonalab.test',
          smtpHost: 'smtp.zonalab.test',
          smtpUser: 'notificador@zonalab.test',
          smtpPort: 587,
          smtpAppPassword: 'app-password-secreta',
        }),
      );
    });

    expect(
      await screen.findByText('La configuración se guardó correctamente.'),
    ).toBeInTheDocument();
  });

  it('envía un correo de prueba desde el panel', async () => {
    sendAdminTestEmail.mockResolvedValue({ sent: true });

    render(<AdminSettingsPage />);

    fireEvent.click(await screen.findByRole('button', { name: /Enviar email de prueba/i }));

    expect(
      await screen.findByText('El correo de prueba se envió correctamente.'),
    ).toBeInTheDocument();
    expect(sendAdminTestEmail).toHaveBeenCalledTimes(1);
  });
});
