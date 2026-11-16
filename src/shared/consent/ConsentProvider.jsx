import { useCallback, useMemo, useState } from 'react';

import { ConsentContext } from './consent-context.js';

const STORAGE_KEY = 'zl_cookie_consent';

function readConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(readConsent);
  const [isBannerOpen, setIsBannerOpen] = useState(() => readConsent() === null);

  const saveConsent = useCallback((nextConsent) => {
    const value = {
      necessary: true,
      analytics: Boolean(nextConsent.analytics),
      marketing: Boolean(nextConsent.marketing),
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Sin almacenamiento persistente igual aplicamos la decisión en memoria.
    }

    setConsent(value);
    setIsBannerOpen(false);
  }, []);

  const openPreferences = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  const value = useMemo(
    () => ({ consent, saveConsent, isBannerOpen, openPreferences }),
    [consent, saveConsent, isBannerOpen, openPreferences],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
