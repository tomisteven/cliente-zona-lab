import { useEffect, useState } from 'react';

import { getPublicSettings } from './site-settings.api.js';
import { DEFAULT_SITE_SETTINGS, SiteSettingsContext } from './site-settings.context.js';

export default function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();

    getPublicSettings({ signal: controller.signal })
      .then((response) => {
        if (response?.settings) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...response.settings });
        }
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setSettings(DEFAULT_SITE_SETTINGS);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}
