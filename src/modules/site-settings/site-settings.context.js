import { createContext, useContext } from 'react';

export const DEFAULT_SITE_SETTINGS = Object.freeze({
  heroTitle: 'CREÁ TU PROPIA LÍNEA DE BOLSOS.',
  heroSubtitle:
    'Personalizá bolsos, mochilas y accesorios para tu marca, club o empresa. Diseño propio, producción por cantidad y atención directa.',
  heroImageUrl: '',
  whatsappNumber: '',
});

export const SiteSettingsContext = createContext(DEFAULT_SITE_SETTINGS);

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
