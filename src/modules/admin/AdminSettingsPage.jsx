import { useEffect, useState } from 'react';

import { ErrorState, InlineMessage, LoadingState } from '../../shared/components/PageStates.jsx';
import {
  deleteAdminMedia,
  getAdminSettings,
  sendAdminTestEmail,
  updateAdminSettings,
} from './admin.api.js';
import AdminImageField from './AdminImageField.jsx';

const EMPTY_FORM = {
  whatsappNumber: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImageUrl: '',
  emailNotificationsEnabled: false,
  notificationEmail: '',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpAppPassword: '',
  clearSmtpAppPassword: false,
};

function mapSettingsToForm(settings) {
  return {
    whatsappNumber: settings.whatsappNumber,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroImageUrl: settings.heroImageUrl ?? '',
    emailNotificationsEnabled: Boolean(settings.emailNotificationsEnabled),
    notificationEmail: settings.notificationEmail ?? '',
    smtpHost: settings.smtpHost ?? '',
    smtpPort: String(settings.smtpPort ?? 587),
    smtpSecure: Boolean(settings.smtpSecure),
    smtpUser: settings.smtpUser ?? '',
    smtpAppPassword: '',
    clearSmtpAppPassword: false,
  };
}

export default function AdminSettingsPage() {
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialHeroImageUrl, setInitialHeroImageUrl] = useState('');
  const [hasSmtpAppPassword, setHasSmtpAppPassword] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailMessage, setTestEmailMessage] = useState(null);
  const [testEmailError, setTestEmailError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setLoadError(null);

    getAdminSettings({ signal: controller.signal })
      .then((response) => {
        const settings = response.settings;

        setForm(mapSettingsToForm(settings));
        setInitialHeroImageUrl(settings.heroImageUrl ?? '');
        setHasSmtpAppPassword(Boolean(settings.hasSmtpAppPassword));
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
    setTestEmailMessage(null);
    setTestEmailError(null);

    const payload = {
      whatsappNumber: form.whatsappNumber.trim(),
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      heroImageUrl: form.heroImageUrl,
      emailNotificationsEnabled: form.emailNotificationsEnabled,
      notificationEmail: form.notificationEmail.trim(),
      smtpHost: form.smtpHost.trim(),
      smtpPort: Number(form.smtpPort),
      smtpSecure: form.smtpSecure,
      smtpUser: form.smtpUser.trim(),
      clearSmtpAppPassword: form.clearSmtpAppPassword,
    };

    if (form.smtpAppPassword.trim()) {
      payload.smtpAppPassword = form.smtpAppPassword.trim();
    }

    try {
      const response = await updateAdminSettings(payload);

      setForm(mapSettingsToForm(response.settings));
      setHasSmtpAppPassword(Boolean(response.settings.hasSmtpAppPassword));

      if (initialHeroImageUrl && initialHeroImageUrl !== response.settings.heroImageUrl) {
        deleteAdminMedia(initialHeroImageUrl).catch(() => {});
      }

      setInitialHeroImageUrl(response.settings.heroImageUrl ?? '');
      setSuccessMessage('La configuración se guardó correctamente.');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTestingEmail(true);
    setTestEmailMessage(null);
    setTestEmailError(null);

    try {
      await sendAdminTestEmail();
      setTestEmailMessage('El correo de prueba se envió correctamente.');
    } catch (error) {
      setTestEmailError(error.message);
    } finally {
      setTestingEmail(false);
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
          <p>Actualizá la portada, el WhatsApp y las notificaciones de nuevos pedidos.</p>
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

        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Notificaciones por email</h2>
            <p>
              Recibí un correo por cada pedido nuevo. Usá una contraseña de aplicación del proveedor
              de correo, no la contraseña principal de la cuenta.
            </p>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.emailNotificationsEnabled}
              onChange={(event) => updateField('emailNotificationsEnabled', event.target.checked)}
            />
            <span>
              <strong>Activar notificaciones</strong>
              <small>
                Se avisa al administrador por pedidos nuevos y al comprador por cambios de estado.
              </small>
            </span>
          </label>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="settings-notification-email">Correo de destino</label>
              <input
                id="settings-notification-email"
                type="email"
                maxLength={254}
                placeholder="pedidos@tu-marca.com"
                value={form.notificationEmail}
                onChange={(event) => updateField('notificationEmail', event.target.value)}
              />
              <p className="field-hint">Acá llegan los avisos de pedidos nuevos.</p>
            </div>

            <div className="form-field">
              <label htmlFor="settings-smtp-user">Usuario SMTP</label>
              <input
                id="settings-smtp-user"
                type="text"
                maxLength={254}
                autoComplete="username"
                placeholder="tu-cuenta@gmail.com"
                value={form.smtpUser}
                onChange={(event) => updateField('smtpUser', event.target.value)}
              />
              <p className="field-hint">Normalmente es la misma cuenta que envía el correo.</p>
            </div>

            <div className="form-field">
              <label htmlFor="settings-smtp-host">Servidor SMTP</label>
              <input
                id="settings-smtp-host"
                type="text"
                maxLength={255}
                placeholder="smtp.gmail.com"
                value={form.smtpHost}
                onChange={(event) => updateField('smtpHost', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="settings-smtp-port">Puerto SMTP</label>
              <input
                id="settings-smtp-port"
                type="number"
                min="1"
                max="65535"
                step="1"
                value={form.smtpPort}
                onChange={(event) => updateField('smtpPort', event.target.value)}
              />
              <p className="field-hint">587 para TLS o 465 para SSL.</p>
            </div>
          </div>

          <label className="checkbox-field checkbox-field--compact">
            <input
              type="checkbox"
              checked={form.smtpSecure}
              onChange={(event) => updateField('smtpSecure', event.target.checked)}
            />
            <span>
              <strong>Conexión segura (SSL)</strong>
              <small>Activá esta opción si usás el puerto 465.</small>
            </span>
          </label>

          <div className="form-field">
            <label htmlFor="settings-smtp-password">Contraseña de aplicación</label>
            <input
              id="settings-smtp-password"
              type="password"
              maxLength={200}
              autoComplete="new-password"
              placeholder={
                hasSmtpAppPassword
                  ? 'Contraseña guardada. Dejá vacío para conservarla.'
                  : 'Contraseña de aplicación del correo'
              }
              value={form.smtpAppPassword}
              onChange={(event) => updateField('smtpAppPassword', event.target.value)}
            />
            <p className="field-hint">
              Se guarda cifrada y nunca se muestra de nuevo. Ejemplo Gmail: Cuenta → Seguridad →
              Contraseñas de aplicación.
            </p>
          </div>

          {hasSmtpAppPassword && (
            <label className="checkbox-field checkbox-field--compact">
              <input
                type="checkbox"
                checked={form.clearSmtpAppPassword}
                onChange={(event) => {
                  updateField('clearSmtpAppPassword', event.target.checked);

                  if (event.target.checked) {
                    updateField('smtpAppPassword', '');
                  }
                }}
              />
              <span>
                <strong>Eliminar contraseña guardada</strong>
                <small>Desactiva las notificaciones hasta cargar una nueva.</small>
              </span>
            </label>
          )}

          <div className="admin-form__actions">
            <span />
            <button
              className="button button--outline button--compact"
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail || saving}
            >
              {testingEmail ? 'Enviando prueba…' : 'Enviar email de prueba'}
            </button>
          </div>

          <p className="field-hint">Guardá los cambios antes de enviar el correo de prueba.</p>

          {testEmailError && <InlineMessage tone="error">{testEmailError}</InlineMessage>}
          {testEmailMessage && <InlineMessage tone="success">{testEmailMessage}</InlineMessage>}
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
