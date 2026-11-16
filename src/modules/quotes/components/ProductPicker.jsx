import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../../../shared/components/Icons.jsx';
import { EmptyState, ErrorState } from '../../../shared/components/PageStates.jsx';
import ProductImage from '../../../shared/components/ProductImage.jsx';
import { formatCurrency } from '../../../shared/utils/format.js';
import { buildWhatsAppUrl } from '../../../shared/utils/whatsapp.js';

export default function ProductPicker({
  productsState,
  onSelect,
  onRetry,
  selectedSlug,
  whatsappNumber,
}) {
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    'Hola Zona Lab, no encontré el producto que busco. ¿Me pueden asesorar?',
  );

  if (productsState.status === 'loading') {
    return (
      <div className="picker-grid" role="status" aria-label="Cargando productos">
        {[0, 1, 2, 3].map((item) => (
          <div className="product-choice product-choice--skeleton" key={item}>
            <div />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (productsState.status === 'error') {
    return (
      <ErrorState
        title="No pudimos cargar los productos."
        message={productsState.error}
        onRetry={onRetry}
      />
    );
  }

  if (productsState.items.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay productos para elegir."
        message="Escribinos y te ayudamos a definir la pieza que necesitás."
        action={
          whatsappUrl ? (
            <a className="button button--dark" href={whatsappUrl} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              Hablar con Zona Lab
            </a>
          ) : null
        }
      />
    );
  }

  return (
    <div className="picker-grid">
      {productsState.items.map((product, index) => {
        const features = Array.isArray(product.features) ? product.features.slice(0, 2) : [];
        const imageCount = product.imageCount ?? 1;
        const optionGroupCount = product.optionGroupCount ?? 0;
        const personalizationFee = Number(product.personalizationFee ?? 0);

        return (
          <button
            className={`product-choice ${selectedSlug === product.slug ? 'is-selected' : ''}`}
            key={product.id}
            type="button"
            style={{ '--card-index': index }}
            onClick={() => onSelect(product)}
          >
            <div className="product-choice__media">
              <ProductImage
                src={product.imageUrl}
                alt={product.imageAlt || product.name}
                sizes="96px"
              />

              <span className="product-choice__category">{product.categoryLabel}</span>
              {imageCount > 1 && <span className="product-choice__photos">{imageCount} fotos</span>}
              <span className="product-choice__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="product-choice__body">
              <p className="product-choice__eyebrow">
                <span>{optionGroupCount > 0 ? 'Personalizable' : 'Producción propia'}</span>
                {optionGroupCount > 0 && (
                  <span className="product-choice__badge">{optionGroupCount} opciones</span>
                )}
              </p>

              <h3>{product.name}</h3>
              <p>{product.shortDescription}</p>

              {features.length > 0 && (
                <ul className="product-choice__features">
                  {features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="product-choice__meta">
                <span>
                  <strong>{product.minimumQuantity}</strong> u. mínimo
                </span>
                {personalizationFee > 0 && (
                  <span>Personalización +{formatCurrency(personalizationFee)}</span>
                )}
              </div>

              <div className="product-choice__footer">
                <div>
                  <small>Desde</small>
                  <strong>{formatCurrency(product.startingUnitPrice)}</strong>
                  <span className="product-choice__unit">por unidad</span>
                </div>
                <span className="product-choice__cta">
                  Elegir
                  <ArrowIcon />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
