import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { EmptyState, ErrorState } from '../../shared/components/PageStates.jsx';
import { ArrowIcon } from '../../shared/components/Icons.jsx';
import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { absoluteMediaUrl, getSiteUrl } from '../../shared/seo/urls.js';
import { listCatalogProducts } from './catalog.api.js';
import { CATALOG_CATEGORIES, findCatalogCategory } from './catalog.constants.js';
import ProductCard from './ProductCard.jsx';

const INITIAL_STATE = {
  status: 'loading',
  items: [],
  pagination: null,
  error: null,
};

export default function CategoryPage() {
  const { categoria } = useParams();
  const category = findCatalogCategory(categoria);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('orden');
  const sort = ['newest', 'oldest', 'name'].includes(sortParam) ? sortParam : 'newest';
  const pageParam = Number(searchParams.get('pagina') ?? 1);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const [state, setState] = useState(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);
  const siteUrl = getSiteUrl();
  const jsonLd = useMemo(() => {
    if (!category) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.label} personalizados`,
      url: `${siteUrl}/catalogo/${category.value}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: state.items.length,
        itemListElement: state.items.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
          url: `${siteUrl}/productos/${product.slug}`,
          image: absoluteMediaUrl(product.imageUrl),
        })),
      },
    };
  }, [category, siteUrl, state.items]);

  usePageMeta(
    category ? `${category.label} personalizados` : 'Categoría no encontrada',
    category?.seoDescription,
    {
      path: category ? `/catalogo/${category.value}` : '/catalogo',
      robots: category ? 'index,follow' : 'noindex,follow',
      jsonLd,
    },
  );

  useEffect(() => {
    if (!category) {
      setState({ status: 'success', items: [], pagination: null, error: null });
      return undefined;
    }

    const controller = new AbortController();

    setState(INITIAL_STATE);

    listCatalogProducts({
      page,
      limit: 12,
      category: category.value,
      sort,
      signal: controller.signal,
    })
      .then((response) => {
        setState({
          status: 'success',
          items: response.items ?? [],
          pagination: response.pagination,
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setState({
          status: 'error',
          items: [],
          pagination: null,
          error: error.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [category, page, sort, attempt]);

  function updateQuery({ nextPage = page, nextSort = sort }) {
    const nextParams = new URLSearchParams();

    if (nextSort !== 'newest') {
      nextParams.set('orden', nextSort);
    }

    if (nextPage > 1) {
      nextParams.set('pagina', String(nextPage));
    }

    setSearchParams(nextParams);
  }

  if (!category) {
    return (
      <div className="container page">
        <EmptyState
          title="No encontramos esa categoría."
          message="Volvé al catálogo para ver todos los productos disponibles."
          action={
            <Link className="button button--dark" to="/catalogo">
              Ver catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-hero page-hero--catalog">
        <div className="container">
          <p className="eyebrow eyebrow--accent">Categoría</p>
          <h1>{category.label} personalizados.</h1>
          <p>{category.seoDescription}</p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container">
          <div className="filter-chips" aria-label="Categorías">
            <Link className="filter-chip" to="/catalogo">
              Todos
            </Link>
            {CATALOG_CATEGORIES.map((item) => (
              <Link
                key={item.value}
                className={`filter-chip ${item.value === category.value ? 'is-active' : ''}`}
                to={`/catalogo/${item.value}`}
                aria-current={item.value === category.value ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="catalog-toolbar catalog-toolbar--compact">
            <label className="catalog-sort">
              <span className="sr-only">Ordenar productos</span>
              <select
                value={sort}
                onChange={(event) => updateQuery({ nextSort: event.target.value })}
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </label>
          </div>

          {state.status === 'success' && state.pagination && (
            <p className="results-count" role="status">
              {state.pagination.total === 0
                ? 'Sin resultados'
                : `${state.pagination.total} ${
                    state.pagination.total === 1 ? 'producto' : 'productos'
                  } en ${category.label.toLowerCase()}`}
            </p>
          )}

          {state.status === 'loading' && (
            <div
              className="product-grid product-grid--catalog"
              aria-label="Cargando productos"
              role="status"
            >
              {[0, 1, 2, 3, 4, 5].map((item) => (
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

          {state.status === 'error' && (
            <ErrorState
              title="No pudimos cargar esta categoría."
              message={state.error}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          )}

          {state.status === 'success' && state.items.length === 0 && (
            <EmptyState
              title="Todavía no hay productos en esta categoría."
              message="Consultanos por una pieza personalizada o mirá el catálogo completo."
              action={
                <Link className="button button--dark" to="/catalogo">
                  Ver catálogo completo
                </Link>
              }
            />
          )}

          {state.status === 'success' && state.items.length > 0 && (
            <>
              <div className="product-grid product-grid--catalog">
                {state.items.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {state.pagination && state.pagination.totalPages > 1 && (
                <nav className="pagination" aria-label="Paginación de la categoría">
                  <button
                    className="button button--outline button--compact"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateQuery({ nextPage: page - 1 })}
                  >
                    <ArrowIcon className="icon icon--back" />
                    Anterior
                  </button>
                  <span>
                    Página {state.pagination.page} de {state.pagination.totalPages}
                  </span>
                  <button
                    className="button button--outline button--compact"
                    type="button"
                    disabled={page >= state.pagination.totalPages}
                    onClick={() => updateQuery({ nextPage: page + 1 })}
                  >
                    Siguiente
                    <ArrowIcon />
                  </button>
                </nav>
              )}
            </>
          )}

          <p className="category-back">
            <Link className="text-link" to="/catalogo">
              Ver todos los productos
              <ArrowIcon />
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
