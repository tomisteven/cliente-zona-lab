import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminAuthProvider } from './admin-auth.context.jsx';
import AdminLoginPage from './AdminLoginPage.jsx';
import { getAdminSession, loginAdmin } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  getAdminSession: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/resumen" element={<p>Panel listo</p>} />
          <Route path="/admin/productos" element={<p>Panel listo</p>} />
        </Routes>
      </AdminAuthProvider>
    </MemoryRouter>,
  );
}

function unauthorizedError() {
  return Object.assign(new Error('Necesitás iniciar sesión.'), { status: 401 });
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    getAdminSession.mockRejectedValue(unauthorizedError());
    loginAdmin.mockResolvedValue({
      user: { email: 'admin@zonalab.test' },
      csrfToken: 'token',
      expiresAt: 0,
    });
  });

  it('inicia sesión y navega al panel', async () => {
    renderLogin();

    expect(await screen.findByRole('heading', { name: /Ingresá al panel/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: ' admin@zonalab.test ' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'clave-de-prueba' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(loginAdmin).toHaveBeenCalledWith({
        email: 'admin@zonalab.test',
        password: 'clave-de-prueba',
      });
    });
    expect(await screen.findByText('Panel listo')).toBeInTheDocument();
  });

  it('muestra el error cuando las credenciales son inválidas', async () => {
    loginAdmin.mockRejectedValue(
      Object.assign(new Error('Correo o contraseña incorrectos.'), { status: 401 }),
    );

    renderLogin();

    fireEvent.change(await screen.findByLabelText(/Correo electrónico/i), {
      target: { value: 'admin@zonalab.test' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'incorrecta' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });
});
