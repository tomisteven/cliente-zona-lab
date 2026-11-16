import { createContext, useContext } from 'react';

export const ConsentContext = createContext(null);

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error('useConsent debe usarse dentro de ConsentProvider.');
  }

  return context;
}
