import { Link } from 'react-router-dom';

import { EmptyState } from '../shared/components/PageStates.jsx';
import { usePageMeta } from '../shared/hooks/usePageMeta.js';

export default function NotFoundPage() {
  usePageMeta('Página no encontrada', 'El contenido que buscás no está disponible.', {
    robots: 'noindex,follow',
  });

  return (
    <div className="container page">
      <EmptyState
        title="No encontramos esta página."
        message="El enlace puede haber cambiado o el contenido ya no está disponible."
        action={
          <Link className="button button--dark" to="/">
            Volver al inicio
          </Link>
        }
      />
    </div>
  );
}
