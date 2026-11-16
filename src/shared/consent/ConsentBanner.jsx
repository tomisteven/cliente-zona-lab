import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useConsent } from './consent-context.js';

export default function ConsentBanner() {
  const { consent, saveConsent, isBannerOpen } = useConsent();
  const [analytics, setAnalytics] = useState(Boolean(consent?.analytics));
  const [marketing, setMarketing] = useState(Boolean(consent?.marketing));
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isBannerOpen) {
      return;
    }

    setAnalytics(Boolean(consent?.analytics));
    setMarketing(Boolean(consent?.marketing));
    setShowDetails(false);
  }, [consent, isBannerOpen]);

  if (!isBannerOpen) {
    return null;
  }

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
  }

  function acceptNecessary() {
    saveConsent({ analytics: false, marketing: false });
  }

  function saveSelection() {
    saveConsent({ analytics, marketing });
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner__content">
        <div>
          <p className="eyebrow">Cookies</p>
          <h2 id="cookie-banner-title">Tu privacidad, bajo control.</h2>
          <p>
            Usamos cookies necesarias para que el sitio funcione. Con tu permiso, también podemos
            medir visitas y campañas publicitarias. Podés cambiar tu elección cuando quieras.
          </p>
          <p className="cookie-banner__links">
            <Link to="/cookies">Política de cookies</Link>
            <Link to="/privacidad">Privacidad</Link>
          </p>
        </div>

        {showDetails && (
          <div className="cookie-banner__preferences">
            <label className="checkbox-field checkbox-field--compact">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Necesarias</strong>
                <small>Siempre activas para seguridad y funcionamiento.</small>
              </span>
            </label>
            <label className="checkbox-field checkbox-field--compact">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <strong>Analítica</strong>
                <small>Nos ayuda a entender qué páginas y productos funcionan mejor.</small>
              </span>
            </label>
            <label className="checkbox-field checkbox-field--compact">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />
              <span>
                <strong>Publicidad</strong>
                <small>Permite medir campañas en Google y Meta.</small>
              </span>
            </label>
          </div>
        )}

        <div className="cookie-banner__actions">
          <button
            className="button button--outline button--compact"
            type="button"
            onClick={showDetails ? saveSelection : () => setShowDetails(true)}
          >
            {showDetails ? 'Guardar selección' : 'Configurar'}
          </button>
          <button
            className="button button--outline button--compact"
            type="button"
            onClick={acceptNecessary}
          >
            Solo necesarias
          </button>
          <button className="button button--dark button--compact" type="button" onClick={acceptAll}>
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}
