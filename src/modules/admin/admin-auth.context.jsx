import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAdminSession, loginAdmin, logoutAdmin } from './admin.api.js';
import { AdminAuthContext } from './admin-auth.context.js';

const ANONYMOUS_STATE = {
  status: 'anonymous',
  user: null,
  error: null,
};

export function AdminAuthProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    error: null,
  });

  const refreshSession = useCallback(async () => {
    setState({ status: 'loading', user: null, error: null });

    try {
      const session = await getAdminSession();
      setState({ status: 'authenticated', user: session.user, error: null });
    } catch (error) {
      setState({ ...ANONYMOUS_STATE, error: error.status === 503 ? error.message : null });
    }
  }, []);

  useEffect(() => {
    refreshSession();

    function handleUnauthorized() {
      setState(ANONYMOUS_STATE);
    }

    window.addEventListener('admin:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('admin:unauthorized', handleUnauthorized);
    };
  }, [refreshSession]);

  const login = useCallback(async (credentials) => {
    const session = await loginAdmin(credentials);
    setState({ status: 'authenticated', user: session.user, error: null });
    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
      setState(ANONYMOUS_STATE);
    } catch (error) {
      setState({
        ...ANONYMOUS_STATE,
        error: error.status === 401 ? null : error.message,
      });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout, refreshSession }),
    [state, login, logout, refreshSession],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
