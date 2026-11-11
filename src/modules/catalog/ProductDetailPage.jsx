import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../../shared/components/Icons.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import ProductImage from '../../shared/components/ProductImage.jsx';
import { formatCurrency, formatQuantityRange } from '../../shared/utils/format.js';
import { buildWhatsAppUrl } from '../../shared/utils/whatsapp.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';
import { getCatalogProduct } from './catalog.api.js';

const INITIAL_STATE = {
  status: 'loading',
  product: null,
  error: null,
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const settings = useSiteSettings();
  const [state, setState] = useState(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    getCatalogProduct(slug, { signal: controller.signal })
      .then((response) => {
        setState({ status: 'success', product: response.product, error: null });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setState({
          status: error.status === 404 ? 'notFound' : 'error',
          product: null,
          error: error.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [slug, attempt]);

  if (state.status === 'loading') {
    return (
      <div className="container page">
        <LoadingState label="Cargando producto…" />
      </div>
    );
  }

  if (state.status === 'notFound') {
    return (
      <div className="container page">
        <EmptyState
          title="Este producto ya no está disponible."
          message="Podés ver otras opciones del catálogo o consultarnos por una pieza similar."
          action={
            <Link className="button button--dark" to="/catalogo">
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="container page">
        <ErrorState
          title="No pudimos cargar el producto."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      </div>
    );
  }

  const { product } = state;
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hola Zona Lab, quiero consultar por el producto ${product.name}.`,
  );

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Migas de pan">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/catalogo">Catálogo</Link>
          <span>/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
      </div>

      <section className="product-detail">
        <div className="container product-detail__grid">
          <div className="product-detail__media">
            <ProductImage src={product.imageUrl} alt={product.name} />
            <span className="product-detail__category">{product.categoryLabel}</span>
          </div>

          <div className="product-detail__content">
            <p className="eyebrow">Producto personalizable</p>
            <h1>{product.name}</h1>
            <p className="product-detail__lead">{product.shortDescription}</p>

            <div className="product-detail__price">
              <span>Precio por unidad desde</span>
              <strong>{formatCurrency(product.startingUnitPrice)}</strong>
              <small>Mínimo {product.minimumQuantity} unidades</small>
            </div>

            {product.description && (
              <p className="product-detail__description">{product.description}</p>
            )}

            {product.features.length > 0 && (
              <ul className="feature-list">
                {product.features.map((feature) => (
                  <li key={feature}>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="product-detail__actions">
              <Link
                className="button button--accent button--large"
                to={`/personalizar/${product.slug}`}
              >
                Personalizar este producto
                <ArrowIcon />
              </Link>
              {whatsappUrl && (
                <a
                  className="button button--outline button--large"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon />
                  Consultar
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container product-detail__extra">
          <div className="info-panel">
            <h2>Precios por cantidad</h2>
            <p>El valor final se calcula según la cantidad y las opciones elegidas.</p>
            <div className="table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                  </tr>
                </thead>
                <tbody>
                  {product.priceTiers.map((tier) => (
                    <tr key={`${tier.minQuantity}-${tier.maxQuantity ?? 'open'}`}>
                      <td>{formatQuantityRange(tier)}</td>
                      <td>{formatCurrency(tier.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.personalizationFee > 0 && (
              <p className="table-note">
                La personalización tiene un costo adicional único de{' '}
                {formatCurrency(product.personalizationFee)}.
              </p>
            )}
          </div>

          {product.optionGroups.length > 0 && (
            <div className="info-panel">
              <h2>Opciones disponibles</h2>
              <p>Configurá estas variables en el cotizador antes de enviar tu pedido.</p>
              <div className="option-summary">
                {product.optionGroups.map((group) => (
                  <div key={group.id}>
                    <h3>
                      {group.name}
                      {group.required && <span>Obligatorio</span>}
                    </h3>
                    <p>{group.choices.map((choice) => choice.label).join(' · ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
