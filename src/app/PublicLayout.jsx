import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { CATALOG_CATEGORIES } from '../modules/catalog/catalog.constants.js';
import SiteSettingsProvider from '../modules/site-settings/SiteSettingsProvider.jsx';
import { useSiteSettings } from '../modules/site-settings/site-settings.context.js';
import AnalyticsProvider from '../shared/analytics/AnalyticsProvider.jsx';
import FloatingWhatsApp from '../shared/components/FloatingWhatsApp.jsx';
import SiteFooter from '../shared/components/SiteFooter.jsx';
import SiteHeader from '../shared/components/SiteHeader.jsx';
import ConsentBanner from '../shared/consent/ConsentBanner.jsx';
import { ConsentProvider } from '../shared/consent/ConsentProvider.jsx';

function PublicShell() {
  const settings = useSiteSettings();

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader whatsappNumber={settings.whatsappNumber} />
      <main id="contenido" className="site-main">
        <Outlet />
      </main>
      <SiteFooter whatsappNumber={settings.whatsappNumber} categories={CATALOG_CATEGORIES} />
      <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} />
    </>
  );
}

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
    <ConsentProvider>
      <AnalyticsProvider />
      <SiteSettingsProvider>
        <PublicShell />
        <ConsentBanner />
      </SiteSettingsProvider>
    </ConsentProvider>
  );
}
