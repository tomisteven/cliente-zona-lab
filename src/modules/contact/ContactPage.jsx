import { useState } from 'react';

import { InlineMessage } from '../../shared/components/PageStates.jsx';
import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { buildWhatsAppUrl } from '../../shared/utils/whatsapp.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';
import { sendContactMessage } from './contact.api.js';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactPage() {
  const settings = useSiteSettings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hola Zona Lab, quiero hacer una consulta.',
  );

  usePageMeta(
    'Contacto',
    'Consultanos por bolsos, mochilas y accesorios personalizados para tu marca, club o empresa.',
    { path: '/contacto' },
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });

      setForm(EMPTY_FORM);
      setSuccess(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="page-hero page-hero--catalog">
        <div className="container">
          <p className="eyebrow eyebrow--accent">Contacto</p>
          <h1>Contanos qué tenés en mente.</h1>
          <p>
            Respondemos consultas sobre productos, cantidades, personalización y plazos de
            producción.
          </p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container contact-layout">
          <form className="wizard-panel contact-form" onSubmit={handleSubmit}>
            <div className="wizard-panel__heading">
              <p className="eyebrow">Escribinos</p>
              <h2>Dejanos tus datos.</h2>
              <p>Te respondemos por correo o WhatsApp según lo que nos indiques.</p>
            </div>

            {error && <InlineMessage tone="error">{error}</InlineMessage>}
            {success && (
              <InlineMessage tone="success">
                Recibimos tu consulta. Te vamos a responder a la brevedad.
              </InlineMessage>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="contact-name">Nombre y apellido *</label>
                <input
                  id="contact-name"
                  type="text"
                  maxLength={80}
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-email">Correo electrónico *</label>
                <input
                  id="contact-email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="contact-phone">Teléfono</label>
                <input
                  id="contact-phone"
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="contact-message">Consulta *</label>
              <textarea
                id="contact-message"
                rows={6}
                maxLength={2000}
                required
                placeholder="Producto, cantidad, personalización, fechas…"
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
              />
              <p className="field-hint">{form.message.length}/2000 caracteres</p>
            </div>

            <button
              className="button button--dark button--large"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Enviando…' : 'Enviar consulta'}
            </button>
          </form>

          <aside className="contact-aside">
            <p className="eyebrow">Respuesta directa</p>
            <h2>¿Preferís WhatsApp?</h2>
            <p>
              Para consultas rápidas o para enviar referencias de diseño, escribinos directamente.
            </p>
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
            <p className="contact-aside__note">
              También podés usar el configurador para cotizar un pedido con precio estimado.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
