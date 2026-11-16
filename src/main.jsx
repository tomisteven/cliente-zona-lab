import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App.jsx';
import AppErrorBoundary from './app/AppErrorBoundary.jsx';
import { captureAttribution } from './shared/marketing/attribution.js';
import { installResourceHints } from './shared/seo/resource-hints.js';
import './index.css';

installResourceHints();
captureAttribution();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de la aplicación.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);
