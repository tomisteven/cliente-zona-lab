import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useConsent } from '../consent/consent-context.js';
import { loadAnalytics, trackEvent, trackPageView } from './analytics.js';

export default function AnalyticsProvider() {
  const { consent } = useConsent();
  const location = useLocation();

  useEffect(() => {
    if (!consent) {
      return;
    }

    loadAnalytics(consent);
  }, [consent]);

  useEffect(() => {
    if (!consent?.analytics) {
      return;
    }

    trackPageView(`${location.pathname}${location.search}`);
  }, [consent, location.pathname, location.search]);

  useEffect(() => {
    function handleClick(event) {
      const link = event.target.closest?.('a[href*="wa.me"], a[href*="whatsapp"]');

      if (link) {
        trackEvent('whatsapp_click', { link_url: link.href });
      }
    }

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}
