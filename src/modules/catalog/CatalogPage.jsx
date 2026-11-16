import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { EmptyState, ErrorState } from '../../shared/components/PageStates.jsx';
import { ArrowIcon } from '../../shared/components/Icons.jsx';
import { usePageMeta } from '../../shared/hooks/usePageMeta.js';
import { absoluteMediaUrl, getSiteUrl } from '../../shared/seo/urls.js';
import { listCatalogProducts } from './catalog.api.js';
import { CATALOG_CATEGORIES } from './catalog.constants.js';
import ProductCard from './ProductCard.jsx';

const INITIAL_STATE = {
  status: 'loading',
  items: [],
  pagination: null,
  error: null,
};

function getValidCategory(value) {
  return CATALOG_CATEGORIES.some((category) => category.value === value) ? value : '';
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = getValidCategory(searchParams.get('categoria'));
  const search = searchParams.get('buscar')?.trim() ?? '';
  const sortParam = searchParams.get('orden');
  const sort = ['newest', 'oldest', 'name'].includes(sortParam) ? sortParam : 'newest';
  const pageParam = Number(searchParams.get('pagina') ?? 1);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const [searchInput, setSearchInput] = useState(search);
  const [state, setState] = useState(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);
  const siteUrl = getSiteUrl();
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Catálogo Zona Lab',
      url: `${siteUrl}/catalogo`,
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
    }),
    [siteUrl, state.items],
  );

  usePageMeta(
    'Catálogo de bolsos y accesorios personalizados',
    'Explorá bolsos, mochilas, neceseres, paleteros y fundas personalizables para tu marca, club o empresa.',
    { path: '/catalogo', jsonLd },
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listCatalogProducts({
      page,
      limit: 12,
      category: category || undefined,
      search: search || undefined,
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
  }, [category, search, page, sort, attempt]);

  function updateFilters({
    nextCategory = category,
    nextSearch = search,
    nextPage = 1,
    nextSort = sort,
  }) {
    const nextParams = new URLSearchParams();

    if (nextCategory) {
      nextParams.set('categoria', nextCategory);
    }

    if (nextSearch) {
      nextParams.set('buscar', nextSearch);
    }

    if (nextSort !== 'newest') {
      nextParams.set('orden', nextSort);
    }

    if (nextPage > 1) {
      nextParams.set('pagina', String(nextPage));
    }

    setSearchParams(nextParams);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateFilters({ nextSearch: searchInput.trim() });
  }

  const hasFilters = Boolean(category || search);

  return (
    <div className="page">
      <section className="page-hero page-hero--catalog">
        <div className="container">
          <p className="eyebrow eyebrow--accent">Catálogo Zona Lab</p>
          <h1>Elegí el punto de partida.</h1>
          <p>
            Modelos pensados para personalizar con tu identidad. Filtrá por categoría o buscá el
            producto que tenés en mente.
          </p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="filter-chips" aria-label="Filtrar por categoría">
              <button
                className={`filter-chip ${!category ? 'is-active' : ''}`}
                type="button"
                aria-pressed={!category}
                onClick={() => updateFilters({ nextCategory: '' })}
              >
                Todos
              </button>
              {CATALOG_CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  className={`filter-chip ${category === item.value ? 'is-active' : ''}`}
                  type="button"
                  aria-pressed={category === item.value}
                  onClick={() => navigate(`/catalogo/${item.value}`)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form className="catalog-search" onSubmit={handleSearchSubmit} role="search">
              <label className="sr-only" htmlFor="catalog-search-input">
                Buscar productos
              </label>
              <input
                id="catalog-search-input"
                type="search"
                value={searchInput}
                placeholder="Buscar por nombre o descripción"
                maxLength={80}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button className="button button--dark button--compact" type="submit">
                Buscar
              </button>
            </form>

            <label className="catalog-sort">
              <span className="sr-only">Ordenar productos</span>
              <select
                value={sort}
                onChange={(event) => updateFilters({ nextSort: event.target.value })}
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
                  } encontrados`}
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
              title="No pudimos cargar el catálogo."
              message={state.error}
              onRetry={() => setAttempt((current) => current + 1)}
            />
          )}

          {state.status === 'success' && state.items.length === 0 && (
            <EmptyState
              title="No encontramos productos con esos filtros."
              message="Probá con otra categoría o consultanos por una pieza a medida."
              action={
                hasFilters ? (
                  <button
                    className="button button--dark"
                    type="button"
                    onClick={() => updateFilters({ nextCategory: '', nextSearch: '' })}
                  >
                    Limpiar filtros
                  </button>
                ) : (
                  <Link className="button button--dark" to="/personalizar">
                    Contanos qué buscás
                  </Link>
                )
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
                <nav className="pagination" aria-label="Paginación del catálogo">
                  <button
                    className="button button--outline button--compact"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateFilters({ nextPage: page - 1 })}
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
                    onClick={() => updateFilters({ nextPage: page + 1 })}
                  >
                    Siguiente
                    <ArrowIcon />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
