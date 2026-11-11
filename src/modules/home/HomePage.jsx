import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { resolveMediaUrl } from '../../shared/api/http-client.js';
import { ArrowIcon, CheckIcon, WhatsAppIcon } from '../../shared/components/Icons.jsx';
import { EmptyState, ErrorState } from '../../shared/components/PageStates.jsx';
import { buildWhatsAppUrl } from '../../shared/utils/whatsapp.js';
import { listCatalogProducts } from '../catalog/catalog.api.js';
import ProductCard from '../catalog/ProductCard.jsx';
import { CATALOG_CATEGORIES } from '../catalog/catalog.constants.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Elegí el producto',
    description: 'Explorá el catálogo y seleccioná el modelo que mejor representa a tu marca.',
  },
  {
    number: '02',
    title: 'Personalizalo',
    description: 'Elegí colores y terminaciones, sumá tu logo y contanos tu idea de diseño.',
  },
  {
    number: '03',
    title: 'Definí la cantidad',
    description: 'Indicá cuántas unidades necesitás y consultá el precio estimado por volumen.',
  },
  {
    number: '04',
    title: 'Enviá tu pedido',
    description: 'Completá tus datos y continuá la conversación directamente por WhatsApp.',
  },
];

const AUDIENCES = [
  {
    title: 'Marcas',
    description: 'Piezas personalizadas para lanzamientos, merchandising y regalos corporativos.',
  },
  {
    title: 'Clubes',
    description: 'Bolsos y accesorios para equipos, delegaciones y eventos deportivos.',
  },
  {
    title: 'Empresas',
    description: 'Producción por cantidad con identidad visual aplicada a cada pieza.',
  },
  {
    title: 'Emprendedores',
    description: 'Series cortas para acompañar el crecimiento de tu proyecto.',
  },
];

const INITIAL_PRODUCTS_STATE = {
  status: 'loading',
  items: [],
  error: null,
};

export default function HomePage() {
  const settings = useSiteSettings();
  const [productsState, setProductsState] = useState(INITIAL_PRODUCTS_STATE);
  const [attempt, setAttempt] = useState(0);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hola Zona Lab, quiero consultar por una línea personalizada de bolsos y accesorios.',
  );

  useEffect(() => {
    const controller = new AbortController();

    setProductsState(INITIAL_PRODUCTS_STATE);

    listCatalogProducts({ limit: 6, signal: controller.signal })
      .then((response) => {
        setProductsState({
          status: 'success',
          items: response.items ?? [],
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setProductsState({
          status: 'error',
          items: [],
          error: error.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  return (
    <>
      <section className="hero-home">
        <div className="container hero-home__grid">
          <div className="hero-home__content">
            <p className="eyebrow eyebrow--accent">Fabricación propia · Personalización</p>
            <h1>{settings.heroTitle}</h1>
            <p className="hero-home__subtitle">{settings.heroSubtitle}</p>
            <div className="hero-home__actions">
              <Link className="button button--accent button--large" to="/catalogo">
                Ver catálogo
                <ArrowIcon />
              </Link>
              <Link className="button button--outline-light button--large" to="/personalizar">
                Cotizar mi pedido
              </Link>
            </div>
            <ul className="hero-home__points">
              <li>
                <CheckIcon />
                Diseño a medida
              </li>
              <li>
                <CheckIcon />
                Producción por cantidad
              </li>
              <li>
                <CheckIcon />
                Atención directa
              </li>
            </ul>
          </div>

          <div className="hero-home__visual">
            {settings.heroImageUrl ? (
              <img
                src={resolveMediaUrl(settings.heroImageUrl)}
                alt="Producción personalizada de Zona Lab"
              />
            ) : (
              <div className="hero-art" aria-hidden="true">
                <span className="hero-art__label">ZONA LAB</span>
                <strong>ZL</strong>
                <span className="hero-art__caption">BOLSOS · MOCHILAS · ACCESORIOS</span>
                <span className="hero-art__badge">HECHO A MEDIDA</span>
              </div>
            )}
            <div className="hero-home__tag">
              <span>Tu marca</span>
              <strong>Tu diseño</strong>
            </div>
          </div>
        </div>

        <div className="container hero-strip">
          {CATALOG_CATEGORIES.map((category) => (
            <Link key={category.value} to={`/catalogo?categoria=${category.value}`}>
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="section" id="productos">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2>Piezas listas para tu identidad.</h2>
            </div>
            <Link className="text-link" to="/catalogo">
              Ver todos los productos
              <ArrowIcon />
            </Link>
          </div>

          {productsState.status === 'loading' && (
            <div className="product-grid" aria-label="Cargando productos" role="status">
              {[0, 1, 2].map((item) => (
                <div className="product-card product-card--skeleton" key={item}>
                  <div className="product-card__media" />
                  <div className="product-card__body">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          )}

          {productsState.status === 'error' && (
            <ErrorState
              title="No pudimos cargar el catálogo."
              message={productsState.error}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          )}

          {productsState.status === 'success' && productsState.items.length === 0 && (
            <EmptyState
              title="Estamos preparando el catálogo."
              message="Mientras tanto, contanos qué estás buscando y te asesoramos."
              action={
                whatsappUrl ? (
                  <a
                    className="button button--dark"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon />
                    Consultar por WhatsApp
                  </a>
                ) : null
              }
            />
          )}

          {productsState.status === 'success' && productsState.items.length > 0 && (
            <div className="product-grid">
              {productsState.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--dark" id="como-funciona">
        <div className="container">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow eyebrow--accent">Cómo funciona</p>
              <h2>De la idea al pedido, en cuatro pasos.</h2>
            </div>
            <p>
              Un proceso simple para cotizar tu producción. La confirmación final se realiza
              directamente con nuestro equipo.
            </p>
          </div>

          <ol className="process-grid">
            {PROCESS_STEPS.map((step) => (
              <li className="process-card" key={step.number}>
                <span className="process-card__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>

          <div className="section-action">
            <Link className="button button--accent" to="/personalizar">
              Empezar mi cotización
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="para-quien">
        <div className="container audience-layout">
          <div className="audience-intro">
            <p className="eyebrow">Para quién</p>
            <h2>Tu identidad, aplicada a cada pieza.</h2>
            <p>
              Trabajamos con proyectos que necesitan una línea propia de bolsos y accesorios, desde
              series cortas hasta producciones por cantidad.
            </p>
            <Link className="text-link" to="/personalizar">
              Contanos tu proyecto
              <ArrowIcon />
            </Link>
          </div>

          <div className="audience-grid">
            {AUDIENCES.map((audience, index) => (
              <article className="audience-card" key={audience.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band__inner">
          <div>
            <p className="eyebrow eyebrow--accent">¿Tenés una idea?</p>
            <h2>Armemos juntos tu próxima línea.</h2>
            <p>Elegí el producto, sumá tu logo y contanos la cantidad que necesitás.</p>
          </div>
          <div className="cta-band__actions">
            <Link className="button button--accent button--large" to="/personalizar">
              Cotizar ahora
              <ArrowIcon />
            </Link>
            {whatsappUrl && (
              <a
                className="button button--outline-light button--large"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
