import { useEffect, useState } from 'react';

import { ErrorState, InlineMessage, LoadingState } from '../../shared/components/PageStates.jsx';
import { getAdminSettings, updateAdminSettings } from './admin.api.js';
import AdminImageField from './AdminImageField.jsx';

const EMPTY_FORM = {
  whatsappNumber: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImageUrl: '',
};

export default function AdminSettingsPage() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setLoadError(null);

    getAdminSettings({ signal: controller.signal })
      .then((response) => {
        const settings = response.settings;
        setForm({
          whatsappNumber: settings.whatsappNumber,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroImageUrl: settings.heroImageUrl ?? '',
        });
        setStatus('ready');
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setLoadError(error.message);
        setStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const response = await updateAdminSettings({
        whatsappNumber: form.whatsappNumber.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle.trim(),
        heroImageUrl: form.heroImageUrl,
      });

      setForm({
        whatsappNumber: response.settings.whatsappNumber,
        heroTitle: response.settings.heroTitle,
        heroSubtitle: response.settings.heroSubtitle,
        heroImageUrl: response.settings.heroImageUrl ?? '',
      });
      setSuccessMessage('La configuración se guardó correctamente.');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Cargando configuración…" />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="No pudimos cargar la configuración."
        message={loadError}
        onRetry={() => setAttempt((current) => current + 1)}
      />
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Sitio</p>
          <h1>Configuración</h1>
          <p>Actualizá el contenido de la portada y el número de WhatsApp.</p>
        </div>
      </div>

      {saveError && <InlineMessage tone="error">{saveError}</InlineMessage>}
      {successMessage && <InlineMessage tone="success">{successMessage}</InlineMessage>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Portada</h2>
            <p>Estos textos se muestran en la página de inicio.</p>
          </div>

          <div className="form-field">
            <label htmlFor="settings-hero-title">Título principal *</label>
            <input
              id="settings-hero-title"
              type="text"
              maxLength={120}
              required
              value={form.heroTitle}
              onChange={(event) => updateField('heroTitle', event.target.value)}
            />
            <p className="field-hint">{form.heroTitle.length}/120 caracteres</p>
          </div>

          <div className="form-field">
            <label htmlFor="settings-hero-subtitle">Subtítulo *</label>
            <textarea
              id="settings-hero-subtitle"
              rows={3}
              maxLength={300}
              required
              value={form.heroSubtitle}
              onChange={(event) => updateField('heroSubtitle', event.target.value)}
            />
            <p className="field-hint">{form.heroSubtitle.length}/300 caracteres</p>
          </div>

          <AdminImageField
            id="settings-hero-image"
            label="Imagen de portada"
            value={form.heroImageUrl}
            onChange={(value) => updateField('heroImageUrl', value)}
          />
        </section>

        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Contacto</h2>
            <p>El número se usa en todos los enlaces de WhatsApp del sitio.</p>
          </div>

          <div className="form-field">
            <label htmlFor="settings-whatsapp">Número de WhatsApp *</label>
            <input
              id="settings-whatsapp"
              type="tel"
              maxLength={30}
              required
              placeholder="5491112345678"
              value={form.whatsappNumber}
              onChange={(event) => updateField('whatsappNumber', event.target.value)}
            />
            <p className="field-hint">
              Incluí el código de país. Se guarda solo con dígitos, entre 10 y 15.
            </p>
          </div>
        </section>

        <div className="admin-form__actions">
          <span />
          <button className="button button--dark button--large" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner spinner--light" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              'Guardar configuración'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
