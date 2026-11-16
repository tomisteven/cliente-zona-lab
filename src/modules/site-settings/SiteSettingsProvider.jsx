import { useEffect, useState } from 'react';

import { getPublicSettings } from './site-settings.api.js';
import { DEFAULT_SITE_SETTINGS, SiteSettingsContext } from './site-settings.context.js';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

export default function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer = null;

    getPublicSettings({ signal: controller.signal })
      .then((response) => {
        if (response?.settings) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...response.settings });
        }
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setSettings(DEFAULT_SITE_SETTINGS);

        if (attempt < MAX_RETRIES) {
          retryTimer = window.setTimeout(() => {
            setAttempt((current) => current + 1);
          }, RETRY_DELAY_MS);
        }
      });

    return () => {
      controller.abort();

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [attempt]);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}
