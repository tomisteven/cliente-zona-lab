import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { trackEvent } from '../../shared/analytics/analytics.js';
import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../../shared/components/Icons.jsx';
import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LoadingState,
} from '../../shared/components/PageStates.jsx';
import ProductImage from '../../shared/components/ProductImage.jsx';
import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { absoluteMediaUrl, getSiteUrl } from '../../shared/seo/urls.js';
import { formatCurrency, formatQuantityRange } from '../../shared/utils/format.js';
import { buildWhatsAppUrl } from '../../shared/utils/whatsapp.js';
import { createProductReview, listProductReviews } from '../reviews/review.api.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';
import { getCatalogProduct, listCatalogProducts } from './catalog.api.js';
import ProductCard from './ProductCard.jsx';
import { getProductImages } from './product-images.js';

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
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsState, setReviewsState] = useState({
    status: 'idle',
    items: [],
    summary: { count: 0, average: null },
    error: null,
  });
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '5', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);
  const [reviewError, setReviewError] = useState(null);

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

  const siteUrl = getSiteUrl();
  const seoImages = useMemo(
    () =>
      state.product ? getProductImages(state.product).map((value) => absoluteMediaUrl(value)) : [],
    [state.product],
  );
  const jsonLd = useMemo(() => {
    const product = state.product;

    if (!product) {
      return null;
    }

    const productUrl = `${siteUrl}/productos/${product.slug}`;
    const prices = (product.priceTiers ?? [])
      .map((tier) => Number(tier.unitPrice))
      .filter(Number.isFinite);
    const lowPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highPrice = prices.length > 0 ? Math.max(...prices) : null;
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.shortDescription,
      image: seoImages,
      sku: product.id,
      category: product.categoryLabel,
      brand: {
        '@type': 'Brand',
        name: 'Zona Lab',
      },
      offers:
        lowPrice === null
          ? undefined
          : {
              '@type': 'AggregateOffer',
              priceCurrency: 'ARS',
              lowPrice,
              highPrice,
              offerCount: prices.length,
              availability: 'https://schema.org/InStock',
              url: productUrl,
            },
    };
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Catálogo',
          item: `${siteUrl}/catalogo`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: productUrl,
        },
      ],
    };

    if (reviewsState.summary.count > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewsState.summary.average,
        reviewCount: reviewsState.summary.count,
        bestRating: 5,
        worstRating: 1,
      };
      productSchema.review = reviewsState.items.slice(0, 5).map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.name,
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: review.comment,
        datePublished: review.createdAt,
      }));
    }

    return [productSchema, breadcrumbSchema];
  }, [reviewsState, seoImages, siteUrl, state.product]);

  usePageMeta(
    state.product?.seoTitle || state.product?.name || 'Producto personalizado',
    state.product?.seoDescription || state.product?.shortDescription,
    {
      path: `/productos/${slug}`,
      image: seoImages[0],
      type: 'product',
      jsonLd,
    },
  );

  useEffect(() => {
    if (state.product) {
      setActiveImage(getProductImages(state.product)[0] ?? '');
      trackEvent('view_item', {
        item_id: state.product.id,
        item_name: state.product.name,
        item_category: state.product.categoryLabel,
        price: state.product.startingUnitPrice,
        currency: 'ARS',
      });
    }
  }, [state.product]);

  useEffect(() => {
    if (!state.product) {
      setRelatedProducts([]);
      return undefined;
    }

    const controller = new AbortController();

    listCatalogProducts({
      category: state.product.category,
      limit: 5,
      signal: controller.signal,
    })
      .then((response) => {
        setRelatedProducts(
          (response.items ?? []).filter((item) => item.slug !== state.product.slug).slice(0, 3),
        );
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setRelatedProducts([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [state.product]);

  useEffect(() => {
    if (!state.product) {
      setReviewsState({
        status: 'idle',
        items: [],
        summary: { count: 0, average: null },
        error: null,
      });
      return undefined;
    }

    const controller = new AbortController();

    setReviewsState((current) => ({ ...current, status: 'loading' }));

    listProductReviews(state.product.id, { signal: controller.signal })
      .then((response) => {
        setReviewsState({
          status: 'success',
          items: response.items ?? [],
          summary: response.summary ?? { count: 0, average: null },
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setReviewsState({
            status: 'error',
            items: [],
            summary: { count: 0, average: null },
            error: error.message,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [state.product]);

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
  const productImages = getProductImages(product);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hola Zona Lab, quiero consultar por el producto ${product.name}.`,
  );

  function updateReviewField(field, value) {
    setReviewForm((current) => ({ ...current, [field]: value }));
    setReviewError(null);
    setReviewMessage(null);
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewMessage(null);

    try {
      await createProductReview(product.id, {
        name: reviewForm.name.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      setReviewForm({ name: '', rating: '5', comment: '' });
      setReviewMessage('Recibimos tu reseña. Se publicará después de la moderación.');
      trackEvent('review_submitted', {
        item_id: product.id,
        rating: Number(reviewForm.rating),
      });
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

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
          <div className="product-detail__gallery">
            <div className="product-detail__media">
              <ProductImage
                src={activeImage || product.imageUrl}
                alt={product.imageAlt || product.name}
                priority
                sizes="(max-width: 900px) 100vw, 46vw"
              />
              <span className="product-detail__category">{product.categoryLabel}</span>
            </div>

            {productImages.length > 1 && (
              <div className="product-detail__thumbs" aria-label="Imágenes del producto">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    className={`product-detail__thumb ${
                      (activeImage || product.imageUrl) === imageUrl ? 'is-active' : ''
                    }`}
                    type="button"
                    aria-label={`Ver imagen ${index + 1} de ${productImages.length}`}
                    aria-pressed={(activeImage || product.imageUrl) === imageUrl}
                    onClick={() => setActiveImage(imageUrl)}
                  >
                    <ProductImage
                      src={imageUrl}
                      alt={`${product.imageAlt || product.name} — imagen ${index + 1}`}
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            )}
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

      <section className="section section--compact" id="resenas">
        <div className="container reviews-layout">
          <div>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Opiniones</p>
                <h2>Reseñas del producto.</h2>
              </div>
              {reviewsState.summary.count > 0 && (
                <p className="reviews-summary">
                  <strong>
                    {reviewsState.summary.average?.toLocaleString('es-AR') ?? '—'} / 5
                  </strong>
                  <span>
                    {reviewsState.summary.count}{' '}
                    {reviewsState.summary.count === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </p>
              )}
            </div>

            {reviewsState.status === 'loading' && <p role="status">Cargando reseñas…</p>}

            {reviewsState.status === 'success' && reviewsState.items.length === 0 && (
              <p className="empty-inline">
                Todavía no hay reseñas publicadas. Si ya compraste, podés dejar la primera.
              </p>
            )}

            {reviewsState.items.length > 0 && (
              <div className="review-list">
                {reviewsState.items.map((review) => (
                  <article className="review-card" key={review.id}>
                    <header>
                      <strong>{review.name}</strong>
                      <span aria-label={`${review.rating} de 5`}>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </header>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form className="wizard-panel review-form" onSubmit={handleReviewSubmit}>
            <div className="wizard-panel__heading">
              <p className="eyebrow">Tu opinión</p>
              <h2>Dejá una reseña.</h2>
              <p>Se publica después de una revisión para evitar spam.</p>
            </div>

            {reviewError && <InlineMessage tone="error">{reviewError}</InlineMessage>}
            {reviewMessage && <InlineMessage tone="success">{reviewMessage}</InlineMessage>}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="review-name">Nombre *</label>
                <input
                  id="review-name"
                  type="text"
                  maxLength={80}
                  required
                  value={reviewForm.name}
                  onChange={(event) => updateReviewField('name', event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="review-rating">Puntuación *</label>
                <select
                  id="review-rating"
                  value={reviewForm.rating}
                  onChange={(event) => updateReviewField('rating', event.target.value)}
                >
                  <option value="5">5 — Excelente</option>
                  <option value="4">4 — Muy bueno</option>
                  <option value="3">3 — Bueno</option>
                  <option value="2">2 — Regular</option>
                  <option value="1">1 — Malo</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="review-comment">Comentario *</label>
              <textarea
                id="review-comment"
                rows={4}
                maxLength={1000}
                required
                value={reviewForm.comment}
                onChange={(event) => updateReviewField('comment', event.target.value)}
              />
              <p className="field-hint">{reviewForm.comment.length}/1000 caracteres</p>
            </div>

            <button className="button button--dark" type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Enviando…' : 'Enviar reseña'}
            </button>
          </form>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section section--compact">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Seguí explorando</p>
                <h2>Productos relacionados.</h2>
              </div>
              <Link className="text-link" to={`/catalogo/${product.category}`}>
                Ver {product.categoryLabel.toLowerCase()}
                <ArrowIcon />
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
