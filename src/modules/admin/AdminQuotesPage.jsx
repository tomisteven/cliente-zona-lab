import { useEffect, useState } from 'react';

import { WhatsAppIcon } from '../../shared/components/Icons.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import { formatCurrency, formatDate, formatFileSize } from '../../shared/utils/format.js';
import { getAdminQuoteFileUrl, listAdminQuotes } from './admin.api.js';

const INITIAL_STATE = {
  status: 'loading',
  items: [],
  pagination: null,
  error: null,
};

function QuoteFileLink({ quoteId, kind, file, label }) {
  if (!file) {
    return null;
  }

  return (
    <a
      className="text-link"
      href={getAdminQuoteFileUrl(quoteId, kind)}
      target="_blank"
      rel="noreferrer"
    >
      {label} · {file.originalName} ({formatFileSize(file.sizeBytes)})
    </a>
  );
}

export default function AdminQuotesPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminQuotes({ page, limit: 20, search, signal: controller.signal })
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
  }, [page, search, attempt]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const pagination = state.pagination;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Pedidos</p>
          <h1>Cotizaciones recibidas</h1>
          <p>Consultá los pedidos registrados y descargá los archivos de diseño.</p>
        </div>
      </div>

      <form className="admin-filters" onSubmit={handleSearchSubmit}>
        <div className="admin-filters__search">
          <label className="sr-only" htmlFor="admin-quote-search">
            Buscar pedidos
          </label>
          <input
            id="admin-quote-search"
            type="search"
            placeholder="Buscar por código, cliente, teléfono o producto…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <button className="button button--outline" type="submit">
          Buscar
        </button>
        {(search || searchInput) && (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setPage(1);
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      {state.status === 'loading' && <LoadingState label="Cargando pedidos…" />}

      {state.status === 'error' && (
        <ErrorState
          title="No pudimos cargar los pedidos."
          message={state.error}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      )}

      {state.status === 'success' && state.items.length === 0 && (
        <EmptyState
          title={search ? 'No encontramos pedidos.' : 'Todavía no hay pedidos.'}
          message={
            search
              ? 'Probá con otro código, nombre o teléfono.'
              : 'Las cotizaciones enviadas desde el configurador van a aparecer acá.'
          }
          action={
            search ? (
              <button
                className="button button--outline"
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
              >
                Quitar búsqueda
              </button>
            ) : null
          }
        />
      )}

      {state.status === 'success' && state.items.length > 0 && (
        <>
          <div className="admin-result-meta">
            <span>
              {pagination?.total} {pagination?.total === 1 ? 'pedido' : 'pedidos'}
            </span>
            <span>Página {pagination?.page}</span>
          </div>

          <div className="quote-admin-list">
            {state.items.map((quote) => (
              <article className="quote-admin-card" key={quote.id}>
                <header className="quote-admin-card__header">
                  <div>
                    <strong>{quote.code}</strong>
                    <span>{formatDate(quote.createdAt, { withTime: true })}</span>
                  </div>
                  <div className="quote-admin-card__price">
                    <span>{quote.pricing.status === 'estimated' ? 'Estimado' : 'A cotizar'}</span>
                    <strong>
                      {quote.pricing.status === 'estimated'
                        ? formatCurrency(quote.pricing.estimatedTotal)
                        : '—'}
                    </strong>
                  </div>
                </header>

                <div className="quote-admin-card__grid">
                  <div>
                    <span className="meta-label">Cliente</span>
                    <strong>{quote.customer.name}</strong>
                    {quote.customer.brandName && <p>{quote.customer.brandName}</p>}
                    <p>
                      <a href={`tel:${quote.customer.phone}`}>{quote.customer.phone}</a>
                    </p>
                    {quote.customer.email && (
                      <p>
                        <a href={`mailto:${quote.customer.email}`}>{quote.customer.email}</a>
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="meta-label">Pedido</span>
                    <strong>{quote.product.name}</strong>
                    <p>
                      {quote.quantity} unidades ·{' '}
                      {quote.pricing.status === 'estimated'
                        ? `${formatCurrency(quote.pricing.unitPrice)} por unidad`
                        : 'precio a cotizar'}
                    </p>
                    {quote.pricing.status === 'estimated' &&
                      quote.pricing.personalizationFee > 0 && (
                        <p>Personalización: {formatCurrency(quote.pricing.personalizationFee)}</p>
                      )}
                  </div>

                  <div className="quote-admin-card__actions">
                    {quote.whatsappUrl && (
                      <a
                        className="button button--outline button--compact"
                        href={quote.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <WhatsAppIcon />
                        Abrir chat
                      </a>
                    )}
                  </div>
                </div>

                <details className="quote-admin-details">
                  <summary>Ver detalle del pedido</summary>

                  <div className="quote-admin-details__body">
                    {quote.selections.length > 0 && (
                      <div>
                        <span className="meta-label">Personalización</span>
                        <ul>
                          {quote.selections.map((selection) => (
                            <li key={selection.groupId}>
                              <strong>{selection.groupName}:</strong> {selection.choiceLabel}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {quote.designNotes && (
                      <div>
                        <span className="meta-label">Indicaciones de diseño</span>
                        <p className="preserve-lines">{quote.designNotes}</p>
                      </div>
                    )}

                    {quote.customer.observations && (
                      <div>
                        <span className="meta-label">Observaciones</span>
                        <p className="preserve-lines">{quote.customer.observations}</p>
                      </div>
                    )}

                    <div>
                      <span className="meta-label">Archivos</span>
                      <div className="quote-admin-files">
                        <QuoteFileLink
                          quoteId={quote.id}
                          kind="logo"
                          file={quote.files.logo}
                          label="Logo"
                        />
                        <QuoteFileLink
                          quoteId={quote.id}
                          kind="reference"
                          file={quote.files.reference}
                          label="Referencia"
                        />
                        {!quote.files.logo && !quote.files.reference && (
                          <p>El pedido no incluye archivos.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              </article>
            ))}
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
