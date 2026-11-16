import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LoadingState,
} from '../../shared/components/PageStates.jsx';
import { formatDate } from '../../shared/utils/format.js';
import { deleteAdminReview, listAdminReviews, setAdminReviewApproved } from './admin.api.js';

const INITIAL_STATE = { status: 'loading', items: [], pagination: null, error: null };

export default function AdminReviewsPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminReviews({ status: filter, page, limit: 20, signal: controller.signal })
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
  }, [filter, page, attempt]);

  async function handleApproval(review, approved) {
    setBusyId(review.id);
    setActionError(null);

    try {
      await setAdminReviewApproved(review.id, approved);

      if (filter === 'pending' || (filter === 'approved' && !approved)) {
        setState((current) => ({
          ...current,
          items: current.items.filter((item) => item.id !== review.id),
        }));
      } else {
        setAttempt((current) => current + 1);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(review) {
    if (!window.confirm('¿Eliminar esta reseña definitivamente?')) {
      return;
    }

    setBusyId(review.id);
    setActionError(null);

    try {
      await deleteAdminReview(review.id);
      setState((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== review.id),
      }));
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
          <p className="eyebrow">Comunidad</p>
          <h1>Reseñas</h1>
          <p>Moderá las opiniones de clientes antes de publicarlas.</p>
        </div>
      </div>

      <div className="admin-filters">
        <label className="sr-only" htmlFor="review-status">
          Filtrar reseñas
        </label>
        <select
          id="review-status"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="pending">Pendientes</option>
          <option value="approved">Publicadas</option>
          <option value="all">Todas</option>
        </select>
      </div>

      {actionError && <InlineMessage tone="error">{actionError}</InlineMessage>}

      {state.status === 'loading' && <LoadingState label="Cargando reseñas…" />}

      {state.status === 'error' && (
        <ErrorState
          title="No pudimos cargar las reseñas."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <EmptyState
          title="No hay reseñas en esta bandeja."
          message="Las opiniones enviadas por clientes aparecen acá para moderación."
        />
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <div className="review-admin-list">
          {state.items.map((review) => (
            <article className="review-admin-card" key={review.id}>
              <header>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.rating} / 5</span>
                </div>
                <span className={`status-badge ${review.approved ? 'is-active' : 'is-new'}`}>
                  {review.approved ? 'Publicada' : 'Pendiente'}
                </span>
              </header>

              <p>{review.comment}</p>

              <footer>
                <div>
                  <Link className="text-link" to={`/productos/${review.productSlug}`}>
                    {review.productName}
                  </Link>
                  <small>{formatDate(review.createdAt, { withTime: true })}</small>
                </div>
                <div className="admin-row-actions">
                  {!review.approved && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleApproval(review, true)}
                    >
                      Publicar
                    </button>
                  )}
                  {review.approved && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleApproval(review, false)}
                    >
                      Ocultar
                    </button>
                  )}
                  <button
                    className="text-button text-button--danger"
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => handleDelete(review)}
                  >
                    Eliminar
                  </button>
                </div>
              </footer>
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
