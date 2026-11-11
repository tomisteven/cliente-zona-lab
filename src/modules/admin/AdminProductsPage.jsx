import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ArrowIcon } from '../../shared/components/Icons.jsx';
import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LoadingState,
} from '../../shared/components/PageStates.jsx';
import ProductImage from '../../shared/components/ProductImage.jsx';
import { formatCurrency } from '../../shared/utils/format.js';
import { CATALOG_CATEGORIES } from '../catalog/catalog.constants.js';
import { deleteAdminProduct, listAdminProducts, setAdminProductStatus } from './admin.api.js';

const INITIAL_STATE = {
  status: 'loading',
  items: [],
  pagination: null,
  error: null,
};

export default function AdminProductsPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminProducts({ page, limit: 20, search, category, signal: controller.signal })
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

        setState({ status: 'error', items: [], pagination: null, error: error.message });
      });

    return () => {
      controller.abort();
    };
  }, [page, search, category, attempt]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setPage(1);
  }

  async function handleToggleStatus(product) {
    setBusyId(product.id);
    setActionError(null);

    try {
      const response = await setAdminProductStatus(product.id, !product.active);

      setState((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === product.id ? { ...item, active: response.product.active } : item,
        ),
      }));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Eliminar “${product.name}”? Dejará de mostrarse en el catálogo.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyId(product.id);
    setActionError(null);

    try {
      await deleteAdminProduct(product.id);

      if (state.items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setAttempt((current) => current + 1);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId(null);
    }
  }

  const pagination = state.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Productos</h1>
          <p>Gestioná modelos, precios por cantidad, opciones y visibilidad.</p>
        </div>
        <Link className="button button--dark" to="/admin/productos/nuevo">
          Nuevo producto
          <ArrowIcon />
        </Link>
      </div>

      <form className="admin-filters" onSubmit={handleSearchSubmit}>
        <div className="admin-filters__search">
          <label className="sr-only" htmlFor="admin-product-search">
            Buscar productos
          </label>
          <input
            id="admin-product-search"
            type="search"
            placeholder="Buscar por nombre o descripción…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <label className="sr-only" htmlFor="admin-product-category">
          Filtrar por categoría
        </label>
        <select
          id="admin-product-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {CATALOG_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <button className="button button--outline" type="submit">
          Buscar
        </button>

        {(search || category || searchInput) && (
          <button className="text-button" type="button" onClick={handleClearFilters}>
            Limpiar
          </button>
        )}
      </form>

      {actionError && <InlineMessage tone="error">{actionError}</InlineMessage>}

      {state.status === 'loading' && <LoadingState label="Cargando productos…" />}

      {state.status === 'error' && (
        <ErrorState
          title="No pudimos cargar los productos."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <EmptyState
          title={search || category ? 'No encontramos productos.' : 'Todavía no hay productos.'}
          message={
            search || category
              ? 'Probá con otra búsqueda o quitá los filtros.'
              : 'Creá el primer producto para empezar a armar el catálogo.'
          }
          action={
            search || category ? (
              <button className="button button--outline" type="button" onClick={handleClearFilters}>
                Quitar filtros
              </button>
            ) : (
              <Link className="button button--dark" to="/admin/productos/nuevo">
                Crear producto
              </Link>
            )
          }
        />
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <>
          <div className="admin-result-meta">
            <span>
              {pagination?.total} {pagination?.total === 1 ? 'producto' : 'productos'}
            </span>
            <span>Página {pagination?.page}</span>
          </div>

          <div className="table-wrap admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Desde</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {state.items.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <ProductImage src={product.imageUrl} alt={product.name} />
                        <div>
                          <strong>{product.name}</strong>
                          <span>/{product.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.categoryLabel}</td>
                    <td>{formatCurrency(product.startingUnitPrice)}</td>
                    <td>{product.minimumQuantity} u.</td>
                    <td>
                      <span
                        className={`status-badge ${product.active ? 'is-active' : 'is-inactive'}`}
                      >
                        {product.active ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link className="text-link" to={`/admin/productos/${product.id}`}>
                          Editar
                        </Link>
                        <button
                          className="text-button"
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.active ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button
                          className="text-button text-button--danger"
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleDelete(product)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="button button--outline button--compact"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </button>
              <span>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="button button--outline button--compact"
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
