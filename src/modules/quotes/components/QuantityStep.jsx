import { InlineMessage } from '../../../shared/components/PageStates.jsx';
import { formatCurrency } from '../../../shared/utils/format.js';

export default function QuantityStep({
  product,
  quantity,
  onQuantityChange,
  quickQuantities,
  estimateState,
  onRetryEstimate,
}) {
  const quantityNumber = Number(quantity);
  const isBelowMinimum =
    quantity !== '' && Number.isFinite(quantityNumber) && quantityNumber < product.minimumQuantity;

  return (
    <div className="wizard-panel">
      <div className="wizard-panel__heading">
        <p className="eyebrow">Paso 3</p>
        <h2>¿Cuántas unidades necesitás?</h2>
        <p>
          El precio por unidad cambia según el volumen. La producción mínima de este producto es de{' '}
          {product.minimumQuantity} unidades.
        </p>
      </div>

      <div className="quantity-layout">
        <div>
          <div className="quick-quantities" aria-label="Cantidades sugeridas">
            {quickQuantities.map((option) => (
              <button
                key={option}
                type="button"
                className={`quantity-chip ${quantityNumber === option ? 'is-active' : ''}`}
                onClick={() => onQuantityChange(String(option))}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="form-field quantity-input">
            <label htmlFor="quote-quantity">Cantidad exacta</label>
            <div className="quantity-input__control">
              <input
                id="quote-quantity"
                type="number"
                inputMode="numeric"
                min={product.minimumQuantity}
                max={1000000}
                step={1}
                value={quantity}
                onChange={(event) => onQuantityChange(event.target.value.replace(/\D/g, ''))}
              />
              <span>unidades</span>
            </div>
            {isBelowMinimum && (
              <p className="field-error" role="alert">
                El mínimo para este producto es {product.minimumQuantity} unidades.
              </p>
            )}
          </div>
        </div>

        <div className="estimate-card" aria-live="polite">
          <p className="eyebrow">Precio estimado</p>

          {estimateState.status === 'idle' && (
            <p className="estimate-card__message">
              Ingresá una cantidad válida para ver el precio estimado.
            </p>
          )}

          {estimateState.status === 'loading' && (
            <div className="estimate-card__loading">
              <span className="spinner spinner--dark" aria-hidden="true" />
              <p>Calculando precio…</p>
            </div>
          )}

          {estimateState.status === 'error' && (
            <>
              <InlineMessage tone="error">{estimateState.error}</InlineMessage>
              <button
                className="button button--outline button--compact"
                type="button"
                onClick={onRetryEstimate}
              >
                Volver a calcular
              </button>
            </>
          )}

          {estimateState.status === 'success' && estimateState.data?.pricing && (
            <>
              {estimateState.data.pricing.status === 'estimated' ? (
                <>
                  <div className="estimate-card__total">
                    <span>Total estimado</span>
                    <strong>{formatCurrency(estimateState.data.pricing.estimatedTotal)}</strong>
                    <small>
                      {quantityNumber} unidades ·{' '}
                      {formatCurrency(estimateState.data.pricing.unitPrice)} por unidad
                    </small>
                  </div>

                  <dl className="estimate-breakdown">
                    <div>
                      <dt>Base por unidad</dt>
                      <dd>{formatCurrency(estimateState.data.pricing.unitBasePrice)}</dd>
                    </div>
                    <div>
                      <dt>Opciones por unidad</dt>
                      <dd>{formatCurrency(estimateState.data.pricing.optionsUnitTotal)}</dd>
                    </div>
                    <div>
                      <dt>Personalización</dt>
                      <dd>{formatCurrency(estimateState.data.pricing.personalizationFee)}</dd>
                    </div>
                  </dl>

                  <p className="estimate-card__note">
                    El precio estimado no incluye envío. La cotización final se confirma por
                    WhatsApp.
                  </p>
                </>
              ) : (
                <>
                  <div className="estimate-card__total">
                    <span>Precio</span>
                    <strong>A cotizar</strong>
                    <small>{quantityNumber} unidades</small>
                  </div>
                  <p className="estimate-card__message">
                    Esta cantidad no tiene un precio publicado. Podés enviar el pedido y el equipo
                    lo cotiza según el diseño y el volumen.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
