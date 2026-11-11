export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola Zona Lab, quiero consultar por la personalización de bolsos y accesorios.';

export function buildWhatsAppUrl(number, message = DEFAULT_WHATSAPP_MESSAGE) {
  const digits = String(number ?? '').replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
