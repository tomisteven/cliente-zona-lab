import { Link } from 'react-router-dom';

import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { buildWhatsAppUrl } from '../../shared/utils/whatsapp.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';
import { FAQ_ITEMS } from './faq.data.js';

export default function FaqPage() {
  const settings = useSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hola Zona Lab, tengo una consulta sobre personalización.',
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  usePageMeta(
    'Preguntas frecuentes',
    'Cantidad mínima, precios, personalización, archivos, plazos y envíos de pedidos personalizados en Zona Lab.',
    { path: '/preguntas-frecuentes', jsonLd },
  );

  return (
    <div className="page">
      <section className="page-hero page-hero--catalog">
        <div className="container">
          <p className="eyebrow eyebrow--accent">Preguntas frecuentes</p>
          <h1>Preguntas frecuentes</h1>
          <p>
            Todo lo que necesitás saber antes de pedir. Si tu duda no está acá, escribinos por
            WhatsApp o desde la página de contacto.
          </p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container faq-layout">
          <div className="faq-list">
            {FAQ_ITEMS.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>

          <aside className="contact-aside">
            <p className="eyebrow">Seguimos hablando</p>
            <h2>¿Tenés otra consulta?</h2>
            <p>Contanos qué necesitás y te respondemos con una propuesta.</p>
            {whatsappUrl && (
              <a
                className="button button--accent"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir WhatsApp
              </a>
            )}
            <Link className="button button--outline-light" to="/contacto">
              Ir a contacto
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
