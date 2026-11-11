import { Link } from 'react-router-dom';

import { ArrowIcon } from '../../shared/components/Icons.jsx';
import ProductImage from '../../shared/components/ProductImage.jsx';
import { formatCurrency } from '../../shared/utils/format.js';

export default function ProductCard({ product }) {
  return (
    <Link className="product-card" to={`/productos/${product.slug}`}>
      <div className="product-card__media">
        <ProductImage src={product.imageUrl} alt={product.name} />
        <span className="product-card__category">{product.categoryLabel}</span>
      </div>
      <div className="product-card__body">
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <div className="product-card__footer">
          <div>
            <span className="product-card__price-label">Desde</span>
            <strong>{formatCurrency(product.startingUnitPrice)}</strong>
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
