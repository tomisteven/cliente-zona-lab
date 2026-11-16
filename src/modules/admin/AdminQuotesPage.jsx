import { useEffect, useState } from 'react';

import { WhatsAppIcon } from '../../shared/components/Icons.jsx';
import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LoadingState,
} from '../../shared/components/PageStates.jsx';
import { formatCurrency, formatDate, formatFileSize } from '../../shared/utils/format.js';
import {
  anonymizeAdminQuote,
  deleteAdminQuote,
  getAdminQuoteFileUrl,
  getAdminQuotesExportUrl,
  listAdminQuotes,
  updateAdminQuote,
} from './admin.api.js';

const INITIAL_STATE = {
  status: 'loading',
  items: [],
  pagination: null,
  error: null,
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'closed', label: 'Cerrado' },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

function QuoteFilePreview({ quoteId, kind, file, label }) {
  if (!file) {
    return null;
  }

  const isImage = file.mimeType.startsWith('image/');
  const extension = file.originalName.split('.').pop()?.toUpperCase() ?? 'ARCHIVO';

  return (
    <div className="quote-file-card">
      <a
        className="quote-file-card__preview"
        href={getAdminQuoteFileUrl(quoteId, kind)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Abrir ${label.toLowerCase()}`}
      >
        {isImage ? (
          <img
            src={getAdminQuoteFileUrl(quoteId, kind, { inline: true })}
            alt={`Vista previa de ${label.toLowerCase()}`}
            loading="lazy"
          />
        ) : (
          <span>{extension}</span>
        )}
      </a>

      <div className="quote-file-card__body">
        <strong>{label}</strong>
        <span title={file.originalName}>
          {file.originalName} · {formatFileSize(file.sizeBytes)}
        </span>
        <a href={getAdminQuoteFileUrl(quoteId, kind)} target="_blank" rel="noreferrer">
          Descargar
        </a>
      </div>
    </div>
  );
}

function QuoteAdminCard({ quote, onUpdated, onRemoved }) {
  const [status, setStatus] = useState(quote.status ?? 'new');
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateAdminQuote(quote.id, {
        status,
        adminNotes: adminNotes.trim(),
      });

      onUpdated(response.quote);
      setSuccess(true);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAnonymize() {
    const confirmed = window.confirm(
      '¿Anonimizar los datos del comprador? Se eliminarán nombre, contacto, notas y archivos.',
    );

    if (!confirmed) {
      return;
    }

    setBusyAction(true);
    setError(null);

    try {
      const response = await anonymizeAdminQuote(quote.id);

      onUpdated(response.quote);
      setStatus(response.quote.status ?? 'new');
      setAdminNotes(response.quote.adminNotes ?? '');
      setSuccess(true);
    } catch (anonymizeError) {
      setError(anonymizeError.message);
    } finally {
      setBusyAction(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente el pedido ${quote.code}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyAction(true);
    setError(null);

    try {
      await deleteAdminQuote(quote.id);
      onRemoved(quote.id);
    } catch (deleteError) {
      setError(deleteError.message);
      setBusyAction(false);
    }
  }

  return (
    <article className="quote-admin-card">
      <header className="quote-admin-card__header">
        <div>
          <div className="quote-admin-card__code">
            <strong>{quote.code}</strong>
            <span className={`status-badge status-badge--quote is-${quote.status ?? 'new'}`}>
              {STATUS_LABELS[quote.status ?? 'new']}
            </span>
          </div>
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
          {quote.pricing.status === 'estimated' && quote.pricing.personalizationFee > 0 && (
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

      {(quote.files.logo || quote.files.reference) && (
        <div className="quote-admin-card__files">
          <QuoteFilePreview quoteId={quote.id} kind="logo" file={quote.files.logo} label="Logo" />
          <QuoteFilePreview
            quoteId={quote.id}
            kind="reference"
            file={quote.files.reference}
            label="Referencia"
          />
        </div>
      )}

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

          {quote.marketing?.source && (
            <div>
              <span className="meta-label">Origen de campaña</span>
              <p>
                {[quote.marketing.source, quote.marketing.medium, quote.marketing.campaign]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {quote.marketing.landingPage && (
                <p className="field-hint">Landing: {quote.marketing.landingPage}</p>
              )}
            </div>
          )}

          <form className="quote-admin-status" onSubmit={handleSubmit}>
            <span className="meta-label">Seguimiento interno</span>

            {error && <InlineMessage tone="error">{error}</InlineMessage>}
            {success && <InlineMessage tone="success">Pedido actualizado.</InlineMessage>}

            <div className="form-field">
              <label htmlFor={`quote-status-${quote.id}`}>Estado</label>
              <select
                id={`quote-status-${quote.id}`}
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSuccess(false);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                Si el comprador dejó un correo, se le avisará automáticamente al cambiar el estado.
              </p>
            </div>

            <div className="form-field">
              <label htmlFor={`quote-notes-${quote.id}`}>Notas internas</label>
              <textarea
                id={`quote-notes-${quote.id}`}
                rows={3}
                maxLength={2000}
                placeholder="Próximo contacto, condiciones acordadas…"
                value={adminNotes}
                onChange={(event) => {
                  setAdminNotes(event.target.value);
                  setSuccess(false);
                }}
              />
              <p className="field-hint">{adminNotes.length}/2000 caracteres</p>
            </div>

            <button
              className="button button--outline button--compact"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Guardando…' : 'Guardar seguimiento'}
            </button>
          </form>

          <div className="quote-admin-privacy">
            <span className="meta-label">Privacidad</span>
            <div>
              <button
                className="text-button"
                type="button"
                disabled={busyAction}
                onClick={handleAnonymize}
              >
                Anonimizar datos
              </button>
              <button
                className="text-button text-button--danger"
                type="button"
                disabled={busyAction}
                onClick={handleDelete}
              >
                Eliminar pedido
              </button>
            </div>
          </div>
        </div>
      </details>
    </article>
  );
}

export default function AdminQuotesPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    listAdminQuotes({
      page,
      limit: 20,
      search,
      status: statusFilter || undefined,
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

        setState({ status: 'error', items: [], pagination: null, error: error.message });
      });

    return () => {
      controller.abort();
    };
  }, [page, search, statusFilter, attempt]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleClearFilters() {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setPage(1);
  }

  function handleQuoteUpdated(updatedQuote) {
    setState((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === updatedQuote.id ? updatedQuote : item)),
    }));
  }

  function handleQuoteRemoved(quoteId) {
    setState((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== quoteId),
    }));
    setAttempt((current) => current + 1);
  }

  const pagination = state.pagination;
  const hasFilters = Boolean(search || statusFilter);

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Pedidos</p>
          <h1>Cotizaciones recibidas</h1>
          <p>Consultá los pedidos registrados, descargá los archivos y seguí su estado.</p>
        </div>
        <div className="admin-page__actions">
          <a
            className="button button--outline"
            href={getAdminQuotesExportUrl({ search, status: statusFilter })}
          >
            Exportar CSV
          </a>
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

        <label className="sr-only" htmlFor="admin-quote-status">
          Filtrar por estado
        </label>
        <select
          id="admin-quote-status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button className="button button--outline" type="submit">
          Buscar
        </button>

        {(hasFilters || searchInput) && (
          <button className="text-button" type="button" onClick={handleClearFilters}>
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
          title={hasFilters ? 'No encontramos pedidos.' : 'Todavía no hay pedidos.'}
          message={
            hasFilters
              ? 'Probá con otro código, nombre, teléfono o estado.'
              : 'Las cotizaciones enviadas desde el configurador van a aparecer acá.'
          }
          action={
            hasFilters ? (
              <button className="button button--outline" type="button" onClick={handleClearFilters}>
                Quitar filtros
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
              <QuoteAdminCard
                key={quote.id}
                quote={quote}
                onUpdated={handleQuoteUpdated}
                onRemoved={handleQuoteRemoved}
              />
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
