import { useEffect, useState } from 'react';

import { getSystemHealth } from './system-status.api.js';

const INITIAL_STATE = {
  status: 'loading',
  health: null,
  error: null,
};

export default function SystemStatusPage() {
  const [state, setState] = useState(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState(INITIAL_STATE);

    getSystemHealth({ signal: controller.signal })
      .then((health) => {
        setState({
          status: 'success',
          health,
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setState({
          status: 'error',
          health: null,
          error: error instanceof Error ? error.message : 'Error desconocido.',
        });
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  return (
    <section className="status-card" aria-labelledby="system-status-title">
      <p className="eyebrow">Infraestructura</p>
      <h2 id="system-status-title">Estado del sistema</h2>
      <p className="status-card__description">
        Comprobación mínima de la conexión entre el frontend y la API.
      </p>

      {state.status === 'loading' && <p role="status">Verificando conexión con el backend…</p>}

      {state.status === 'error' && (
        <div className="feedback feedback--error" role="alert">
          <p>No se pudo verificar el estado del backend.</p>
          <p className="feedback__detail">{state.error}</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {state.status === 'success' && (
        <div className="feedback feedback--success" role="status">
          <p>Backend operativo.</p>
          <dl className="status-details">
            <div>
              <dt>Servicio</dt>
              <dd>{state.health?.service ?? 'No informado'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{state.health?.status ?? 'No informado'}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
