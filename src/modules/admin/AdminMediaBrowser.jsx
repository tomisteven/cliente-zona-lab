import { useEffect, useState } from 'react';

import { resolveMediaUrl } from '../../shared/api/http-client.js';
import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LoadingState,
} from '../../shared/components/PageStates.jsx';
import { formatDate, formatFileSize } from '../../shared/utils/format.js';
import { deleteAdminMedia, listAdminMedia } from './admin.api.js';

const INITIAL_STATE = { status: 'loading', items: [], pagination: null, error: null };

export default function AdminMediaBrowser({ onSelect = null }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [busyFile, setBusyFile] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [copiedFile, setCopiedFile] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminMedia({ search, page, limit: 24, signal: controller.signal })
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

    return () => controller.abort();
  }, [search, page, attempt]);

  async function handleCopy(item) {
    setActionError(null);

    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedFile(item.fileName);
      window.setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      setActionError(`No se pudo copiar. La URL es ${item.url}`);
    }
  }

  async function handleDelete(item) {
    if (
      !window.confirm(`¿Eliminar la imagen ${item.fileName}? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    setBusyFile(item.fileName);
    setActionError(null);

    try {
      await deleteAdminMedia(item.url);
      setAttempt((current) => current + 1);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyFile(null);
    }
  }

  const pagination = state.pagination;

  return (
    <div className="media-browser">
      <div className="admin-filters">
        <label className="sr-only" htmlFor={onSelect ? 'media-picker-search' : 'media-search'}>
          Buscar imágenes
        </label>
        <input
          id={onSelect ? 'media-picker-search' : 'media-search'}
          type="search"
          placeholder="Buscar por nombre de archivo"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      {actionError && <InlineMessage tone="error">{actionError}</InlineMessage>}

      {state.status === 'loading' && <LoadingState label="Cargando imágenes…" />}

      {state.status === 'error' && (
        <ErrorState
          title="No pudimos cargar la biblioteca."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <EmptyState
          title={search ? 'No encontramos imágenes con ese nombre.' : 'La biblioteca está vacía.'}
          message={
            search
              ? 'Probá con otra búsqueda o limpiá el filtro.'
              : 'Subí imágenes desde un producto o desde la portada para verlas acá.'
          }
        />
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <div className="media-grid">
          {state.items.map((item) => (
            <article className="media-card" key={item.url}>
              <div className="media-card__preview">
                <img src={resolveMediaUrl(item.url)} alt="" loading="lazy" />
                {item.inUse && <span className="media-card__badge">En uso</span>}
              </div>

              <div className="media-card__body">
                <strong title={item.fileName}>{item.fileName}</strong>
                <span>
                  {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
                  {formatFileSize(item.sizeBytes)}
                </span>
                <span>{formatDate(item.createdAt)}</span>

                <div className="media-card__actions">
                  {onSelect ? (
                    <button
                      className="button button--dark button--compact"
                      type="button"
                      onClick={() => onSelect(item.url)}
                    >
                      Usar imagen
                    </button>
                  ) : (
                    <>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => handleCopy(item)}
                      >
                        {copiedFile === item.fileName ? 'Copiado' : 'Copiar URL'}
                      </button>
                      <button
                        className="text-button text-button--danger"
                        type="button"
                        disabled={item.inUse || busyFile === item.fileName}
                        onClick={() => handleDelete(item)}
                      >
                        {busyFile === item.fileName ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
    </div>
  );
}
