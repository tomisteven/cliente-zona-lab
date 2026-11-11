import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '../../shared/components/PageStates.jsx';
import { useAdminAuth } from './admin-auth.context.js';

export default function AdminProtectedRoute() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="admin-gate">
        <LoadingState label="Verificando sesión…" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
