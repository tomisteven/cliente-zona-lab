import { ArrowIcon, WhatsAppIcon } from '../../../shared/components/Icons.jsx';
import { InlineMessage } from '../../../shared/components/PageStates.jsx';
import { formatCurrency } from '../../../shared/utils/format.js';

function getSelectedOptions(product, selections) {
  return product.optionGroups
    .map((group) => {
      const choice = group.choices.find((item) => item.id === selections[group.id]);

      return choice ? { group: group.name, choice: choice.label } : null;
    })
    .filter(Boolean);
}

export default function ReviewStep({
  product,
  selections,
  quantity,
  pricing,
  logoFile,
  referenceFile,
  designNotes,
  customer,
  onCustomerChange,
  onSubmit,
  onBack,
  submitting,
  error,
}) {
  const selectedOptions = getSelectedOptions(product, selections);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    onCustomerChange(name, value);
  }

  return (
    <div className="wizard-panel">
      <div className="wizard-panel__heading">
        <p className="eyebrow">Paso 4</p>
        <h2>Revisá el pedido y completá tus datos.</h2>
        <p>
          Al confirmar, el pedido queda registrado y se abre WhatsApp con el resumen listo para
          enviar.
        </p>
      </div>

      <div className="review-grid">
        <div className="review-card">
          <h3>Resumen del pedido</h3>

          <dl className="review-list">
            <div>
              <dt>Producto</dt>
              <dd>{product.name}</dd>
            </div>
            <div>
              <dt>Cantidad</dt>
              <dd>{quantity} unidades</dd>
            </div>
            {selectedOptions.map((option) => (
              <div key={option.group}>
                <dt>{option.group}</dt>
                <dd>{option.choice}</dd>
              </div>
            ))}
            <div>
              <dt>Logo</dt>
              <dd>{logoFile ? logoFile.name : 'Sin archivo'}</dd>
            </div>
            <div>
              <dt>Referencia</dt>
              <dd>{referenceFile ? referenceFile.name : 'Sin archivo'}</dd>
            </div>
          </dl>

          {designNotes && (
            <div className="review-note">
              <strong>Indicaciones de diseño</strong>
              <p>{designNotes}</p>
            </div>
          )}
        </div>

        <div className="review-price">
          <p className="eyebrow">Precio estimado</p>
          <strong>
            {pricing.status === 'estimated' ? formatCurrency(pricing.estimatedTotal) : 'A cotizar'}
          </strong>
          <p>
            {pricing.status === 'estimated'
              ? `${quantity} unidades · ${formatCurrency(pricing.unitPrice)} por unidad`
              : 'El equipo confirmará el valor según la cantidad y el diseño.'}
          </p>
          <small>No incluye envío. La cotización final se confirma por WhatsApp.</small>
        </div>
      </div>

      <form className="customer-form" id="quote-review-form" onSubmit={onSubmit}>
        <h3>Tus datos</h3>

        {error && <InlineMessage tone="error">{error}</InlineMessage>}

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="customer-name">Nombre y apellido *</label>
            <input
              id="customer-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              required
              value={customer.name}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-brand">Marca o institución</label>
            <input
              id="customer-brand"
              name="brandName"
              type="text"
              autoComplete="organization"
              maxLength={80}
              value={customer.brandName}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-phone">Teléfono *</label>
            <input
              id="customer-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              required
              value={customer.phone}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="customer-email">Correo electrónico</label>
            <input
              id="customer-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={customer.email}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="customer-observations">Observaciones</label>
          <textarea
            id="customer-observations"
            name="observations"
            rows={4}
            maxLength={1000}
            placeholder="Fechas de entrega, destino, consultas adicionales…"
            value={customer.observations}
            onChange={handleFieldChange}
          />
          <p className="field-hint">{customer.observations.length}/1000 caracteres</p>
        </div>

        <div className="review-actions">
          <button
            className="button button--outline"
            type="button"
            onClick={onBack}
            disabled={submitting}
          >
            Volver
          </button>
          <button
            className="button button--accent button--large"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner spinner--dark" aria-hidden="true" />
                Registrando pedido…
              </>
            ) : (
              <>
                <WhatsAppIcon />
                Confirmar y abrir WhatsApp
                <ArrowIcon />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
