import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { InlineMessage, LoadingState } from '../../shared/components/PageStates.jsx';
import { useAdminAuth } from './admin-auth.context.js';

export default function AdminLoginPage() {
  const { status, error: sessionError, login } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fromLocation = location.state?.from;
  const redirectTarget = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search ?? ''}`
    : '/admin/productos';

  if (status === 'authenticated') {
    return <Navigate to={redirectTarget} replace />;
  }

  if (status === 'loading') {
    return (
      <div className="admin-gate">
        <LoadingState label="Verificando sesión…" />
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await login({ email: email.trim(), password });
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__art" aria-hidden="true">
        <span>ZONA LAB</span>
        <strong>ZL</strong>
        <p>Panel de administración</p>
      </div>

      <div className="admin-login__panel">
        <Link className="brand brand--dark" to="/">
          <span className="brand__mark">ZL</span>
          <span className="brand__text">
            ZONA<span>LAB</span>
          </span>
        </Link>

        <div className="admin-login__heading">
          <p className="eyebrow">Acceso privado</p>
          <h1>Ingresá al panel.</h1>
          <p>Gestioná productos, pedidos y la configuración del sitio.</p>
        </div>

        {(formError || sessionError) && (
          <InlineMessage tone="error">{formError ?? sessionError}</InlineMessage>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button className="button button--dark button--large" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner spinner--light" aria-hidden="true" />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <Link className="text-link admin-login__back" to="/">
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}
