import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useSiteSettings } from '../../modules/site-settings/site-settings.context.js';
import { buildWhatsAppUrl } from '../utils/whatsapp.js';
import { CloseIcon, MenuIcon, WhatsAppIcon } from './Icons.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/personalizar', label: 'Personalizar' },
];

export default function SiteHeader() {
  const settings = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Zona Lab, inicio">
          <span className="brand__mark">ZL</span>
          <span className="brand__text">
            ZONA<span>LAB</span>
          </span>
        </Link>

        <nav
          id="site-navigation"
          className={`site-nav ${isOpen ? 'site-nav--open' : ''}`}
          aria-label="Principal"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            className="button button--compact button--accent site-nav__cta"
            to="/personalizar"
            onClick={closeMenu}
          >
            Cotizar ahora
          </Link>

          {whatsappUrl && (
            <a
              className="button button--compact button--ghost site-nav__whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          )}
        </nav>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}
