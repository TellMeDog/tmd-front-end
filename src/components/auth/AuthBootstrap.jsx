import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { reissue } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';

let restorePromise = null;

function restoreSession({ redirectOnFailure }) {
  if (localStorage.getItem('tmd:signed-out') === 'true') {
    useAuthStore.getState().clearSession({ signedOut: true });
    return Promise.resolve();
  }
  if (!restorePromise) {
    const hadSession = localStorage.getItem('tmd:has-session') === 'true';
    restorePromise = reissue()
      .then((session) => {
        useAuthStore.getState().setSession(session);
      })
      .catch(() => {
        if (hadSession || redirectOnFailure) useAuthStore.getState().expireSession();
        else useAuthStore.getState().clearSession();
      })
      .finally(() => {
        restorePromise = null;
      });
  }

  return restorePromise;
}

export default function AuthBootstrap({ children }) {
  const location = useLocation();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const isSessionExpired = useAuthStore((state) => state.isSessionExpired);
  const redirectOnFailure =
    location.pathname === '/favorites' ||
    location.pathname.startsWith('/my') ||
    /^\/places\/[^/]+\/(prep|report)$/.test(location.pathname);

  useEffect(() => {
    if (!isAuthReady) restoreSession({ redirectOnFailure });
  }, [isAuthReady, redirectOnFailure]);

  if (!isAuthReady) {
    return (
      <main className="page simple-status" aria-live="polite">
        로그인 상태를 확인하고 있어요.
      </main>
    );
  }

  if (isSessionExpired && location.pathname !== '/login') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
