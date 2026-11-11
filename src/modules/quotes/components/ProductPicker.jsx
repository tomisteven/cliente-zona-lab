import { ArrowIcon, WhatsAppIcon } from '../../../shared/components/Icons.jsx';
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
      {productsState.items.map((product) => (
        <button
          className={`product-choice ${selectedSlug === product.slug ? 'is-selected' : ''}`}
          key={product.id}
          type="button"
          onClick={() => onSelect(product)}
        >
          <div className="product-choice__media">
            <ProductImage src={product.imageUrl} alt={product.name} />
            <span>{product.categoryLabel}</span>
          </div>
          <div className="product-choice__body">
            <h3>{product.name}</h3>
            <p>{product.shortDescription}</p>
            <div className="product-choice__footer">
              <div>
                <small>Desde</small>
                <strong>{formatCurrency(product.startingUnitPrice)}</strong>
              </div>
              <span>
                Elegir
                <ArrowIcon />
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
