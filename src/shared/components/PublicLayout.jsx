import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import SiteSettingsProvider from '../../modules/site-settings/SiteSettingsProvider.jsx';
import FloatingWhatsApp from './FloatingWhatsApp.jsx';
import SiteFooter from './SiteFooter.jsx';
import SiteHeader from './SiteHeader.jsx';

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return (
    <SiteSettingsProvider>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="site-main">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </SiteSettingsProvider>
  );
}
