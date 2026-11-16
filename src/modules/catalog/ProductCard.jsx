import { Link } from 'react-router-dom';

import { ArrowIcon, CheckIcon } from '../../shared/components/Icons.jsx';
import ProductImage from '../../shared/components/ProductImage.jsx';
import { formatCurrency } from '../../shared/utils/format.js';

export default function ProductCard({ product, index = 0 }) {
  const features = Array.isArray(product.features) ? product.features.slice(0, 2) : [];
  const imageCount = product.imageCount ?? 1;
  const optionGroupCount = product.optionGroupCount ?? 0;
  const personalizationFee = Number(product.personalizationFee ?? 0);

  return (
    <Link
      className="product-card"
      to={`/productos/${product.slug}`}
      style={{ '--card-index': index }}
    >
      <div className="product-card__media">
        <ProductImage src={product.imageUrl} alt={product.imageAlt || product.name} />

        <div className="product-card__media-top">
          <span className="product-card__category">{product.categoryLabel}</span>
          {imageCount > 1 && <span className="product-card__photos">{imageCount} fotos</span>}
        </div>

        <span className="product-card__media-cta" aria-hidden="true">
          Ver producto
          <ArrowIcon />
        </span>
      </div>

      <div className="product-card__body">
        <p className="product-card__eyebrow">
          <span>{optionGroupCount > 0 ? 'Personalizable' : 'Producción propia'}</span>
          {optionGroupCount > 0 && (
            <span className="product-card__badge">{optionGroupCount} opciones</span>
          )}
        </p>

        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>

        {features.length > 0 && (
          <ul className="product-card__features">
            {features.map((feature) => (
              <li key={feature}>
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="product-card__meta">
          <span>
            <strong>{product.minimumQuantity}</strong> u. mínimo
          </span>
          {personalizationFee > 0 && (
            <span>Personalización +{formatCurrency(personalizationFee)}</span>
          )}
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-label">Desde</span>
            <strong>{formatCurrency(product.startingUnitPrice)}</strong>
            <small>por unidad</small>
          </div>

          <span className="product-card__link">
            Ver detalles
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
