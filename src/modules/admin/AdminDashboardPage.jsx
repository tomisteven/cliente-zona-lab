import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import { formatCurrency, formatDate } from '../../shared/utils/format.js';
import { getAdminDashboard } from './admin.api.js';

const INITIAL_STATE = { status: 'loading', data: null, error: null };
const STATUS_LABELS = {
  new: 'Nuevos',
  contacted: 'Contactados',
  closed: 'Cerrados',
};

export default function AdminDashboardPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    getAdminDashboard({ signal: controller.signal })
      .then((data) => {
        setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setState({ status: 'error', data: null, error: error.message });
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  if (state.status === 'loading') {
    return <LoadingState label="Cargando resumen…" />;
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title="No pudimos cargar el resumen."
        message={state.error}
        onRetry={() => setAttempt((current) => current + 1)}
      />
    );
  }

  const { metrics, recentQuotes, topProducts } = state.data;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Resumen</p>
          <h1>Tu operación, de un vistazo.</h1>
          <p>Pedidos, productos y actividad reciente del sitio.</p>
        </div>
        <Link className="button button--dark" to="/admin/pedidos">
          Ver pedidos
        </Link>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Pedidos totales</span>
          <strong>{metrics.quotes.total}</strong>
          <small>{metrics.quotes.byStatus.new} nuevos</small>
        </article>
        <article className="metric-card metric-card--accent">
          <span>Valor estimado</span>
          <strong>{formatCurrency(metrics.quotes.estimatedRevenue)}</strong>
          <small>Pedidos con precio calculado</small>
        </article>
        <article className="metric-card">
          <span>Productos publicados</span>
          <strong>{metrics.products.active}</strong>
          <small>{metrics.products.total} en total</small>
        </article>
        <article className="metric-card">
          <span>Seguimiento</span>
          <strong>{metrics.quotes.byStatus.contacted}</strong>
          <small>{metrics.quotes.byStatus.closed} cerrados</small>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <h2>Pedidos recientes</h2>
            <Link className="text-link" to="/admin/pedidos">
              Ver todos
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="empty-inline">Todavía no hay pedidos.</p>
          ) : (
            <ul className="admin-activity-list">
              {recentQuotes.map((quote) => (
                <li key={quote.id}>
                  <div>
                    <strong>{quote.code}</strong>
                    <span>
                      {quote.customerName} · {quote.productName}
                    </span>
                  </div>
                  <div className="admin-activity-list__meta">
                    <span className={`status-badge is-${quote.status}`}>
                      {STATUS_LABELS[quote.status] ?? quote.status}
                    </span>
                    <small>{formatDate(quote.createdAt, { withTime: true })}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <h2>Productos más pedidos</h2>
            <Link className="text-link" to="/admin/productos">
              Ver productos
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="empty-inline">Todavía no hay datos suficientes.</p>
          ) : (
            <ol className="admin-ranking">
              {topProducts.map((product) => (
                <li key={product.name}>
                  <span>{product.name}</span>
                  <strong>{product.quotes}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
