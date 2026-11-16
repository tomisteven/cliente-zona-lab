import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="container page">
        <div className="state-panel state-panel--error" role="alert">
          <h1>Algo salió mal.</h1>
          <p>Recargá la página para volver a intentar. Si el problema continúa, escribinos.</p>
          <div className="state-panel__actions">
            <button
              className="button button--dark"
              type="button"
              onClick={() => window.location.reload()}
            >
              Recargar la página
            </button>
            <a className="button button--outline" href="/">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
