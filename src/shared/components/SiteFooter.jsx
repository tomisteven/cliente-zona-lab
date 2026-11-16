import { Link } from 'react-router-dom';

import { useConsent } from '../consent/consent-context.js';
import { buildWhatsAppUrl } from '../utils/whatsapp.js';
import { WhatsAppIcon } from './Icons.jsx';

export default function SiteFooter({ whatsappNumber, categories = [] }) {
  const { openPreferences } = useConsent();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link className="brand brand--footer" to="/">
            <span className="brand__mark">ZL</span>
            <span className="brand__text">
              ZONA<span>LAB</span>
            </span>
          </Link>
          <p>
            Diseño, fabricación y personalización de bolsos, mochilas y accesorios para marcas,
            clubes, empresas y emprendedores.
          </p>
          {whatsappUrl && (
            <a className="footer-contact" href={whatsappUrl} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              Hablemos por WhatsApp
            </a>
          )}
        </div>

        <div className="site-footer__column">
          <h2>Navegación</h2>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/personalizar">Personalizar pedido</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link to="/#como-funciona">Cómo funciona</Link>
        </div>

        <div className="site-footer__column">
          <h2>Productos</h2>
          {categories.map((category) => (
            <Link key={category.value} to={`/catalogo/${category.value}`}>
              {category.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__column">
          <h2>Pedidos</h2>
          <p>Producción por cantidad.</p>
          <p>Personalización con tu logo.</p>
          <p>Atención directa por WhatsApp.</p>
          <Link className="footer-link-strong" to="/personalizar">
            Iniciar una cotización
          </Link>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>© {currentYear} Zona Lab. Todos los derechos reservados.</p>
        <nav className="site-footer__legal" aria-label="Información legal">
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Términos</Link>
          <Link to="/cookies">Cookies</Link>
          <button className="text-button" type="button" onClick={openPreferences}>
            Preferencias de cookies
          </button>
        </nav>
        <Link to="/admin/login">Acceso administrador</Link>
      </div>
    </footer>
  );
}
