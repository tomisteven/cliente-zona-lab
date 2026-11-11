export function LoadingState({ label = 'Cargando…' }) {
  return (
    <div className="state-panel state-panel--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title = 'Algo no salió como esperábamos.', message, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="button button--dark" type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-panel state-panel--empty">
      <span className="state-panel__mark">ZL</span>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function InlineMessage({ tone = 'error', children }) {
  if (!children) {
    return null;
  }

  return (
    <p
      className={`inline-message inline-message--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  );
}
