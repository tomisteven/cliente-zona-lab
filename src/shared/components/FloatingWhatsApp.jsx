import { buildWhatsAppUrl } from '../utils/whatsapp.js';
import { WhatsAppIcon } from './Icons.jsx';

export default function FloatingWhatsApp({ whatsappNumber }) {
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      className="floating-whatsapp"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
