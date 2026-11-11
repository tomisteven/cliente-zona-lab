import { Link } from 'react-router-dom';

import { EmptyState } from '../shared/components/PageStates.jsx';

export default function NotFoundPage() {
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
