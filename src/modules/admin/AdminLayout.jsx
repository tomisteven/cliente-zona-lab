import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { useAdminAuth } from './admin-auth.context.js';

const ADMIN_TITLES = {
  '/admin/resumen': 'Resumen',
  '/admin/productos': 'Productos',
  '/admin/productos/nuevo': 'Nuevo producto',
  '/admin/pedidos': 'Pedidos',
  '/admin/resenas': 'Reseñas',
  '/admin/biblioteca': 'Biblioteca',
  '/admin/actividad': 'Actividad',
  '/admin/configuracion': 'Configuración',
};

const ADMIN_LINKS = [
  { to: '/admin/resumen', label: 'Resumen', end: false },
  { to: '/admin/productos', label: 'Productos', end: false },
  { to: '/admin/pedidos', label: 'Pedidos', end: false },
  { to: '/admin/resenas', label: 'Reseñas', end: false },
  { to: '/admin/biblioteca', label: 'Biblioteca', end: false },
  { to: '/admin/actividad', label: 'Actividad', end: false },
  { to: '/admin/configuracion', label: 'Configuración', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  usePageMeta(
    ADMIN_TITLES[location.pathname] ?? 'Panel administrativo',
    'Panel privado de Zona Lab.',
    {
      path: location.pathname,
      robots: 'noindex,nofollow',
    },
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <Link className="brand brand--admin" to="/admin/productos">
            <span className="brand__mark">ZL</span>
            <span className="brand__text">
              ZONA<span>LAB</span>
            </span>
          </Link>
          <span className="admin-header__badge">Panel</span>
        </div>

        <div className="admin-header__actions">
          <Link className="admin-header__site-link" to="/" target="_blank" rel="noreferrer">
            Ver sitio
          </Link>
          <span className="admin-header__user">{user?.email}</span>
          <button
            className="button button--outline button--compact"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Administración">
        <div className="admin-nav__inner">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
