import { useEffect } from 'react';
import { reissue } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';

let restorePromise = null;

function restoreSession() {
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
        if (hadSession) useAuthStore.getState().expireSession();
        else useAuthStore.getState().clearSession();
      })
      .finally(() => {
        restorePromise = null;
      });
  }

  return restorePromise;
}

export default function AuthBootstrap({ children }) {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    if (!isAuthReady) restoreSession();
  }, [isAuthReady]);

  if (!isAuthReady) {
    return (
      <main className="page simple-status" aria-live="polite">
        로그인 상태를 확인하고 있어요.
      </main>
    );
  }

  return children;
}
