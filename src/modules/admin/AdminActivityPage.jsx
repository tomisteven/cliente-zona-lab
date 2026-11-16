import { useEffect, useState } from 'react';

import { EmptyState, ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import { formatDate } from '../../shared/utils/format.js';
import { listAdminAudit } from './admin.api.js';

const INITIAL_STATE = { status: 'loading', items: [], pagination: null, error: null };

export default function AdminActivityPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminAudit({ page, limit: 30, signal: controller.signal })
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
  }, [page, attempt]);

  const pagination = state.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1>Actividad administrativa</h1>
          <p>Registro de mutaciones realizadas desde el panel.</p>
        </div>
      </div>

      {state.status === 'loading' && <LoadingState label="Cargando actividad…" />}

      {state.status === 'error' && (
        <ErrorState
          title="No pudimos cargar la actividad."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <EmptyState
          title="Todavía no hay actividad registrada."
          message="Las acciones administrativas van a aparecer acá."
        />
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <>
          <div className="table-wrap admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Request ID</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.createdAt, { withTime: true })}</td>
                    <td>
                      <code>{entry.action}</code>
                    </td>
                    <td>{entry.actor || '—'}</td>
                    <td>{entry.statusCode}</td>
                    <td>
                      <small>{entry.requestId || '—'}</small>
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
