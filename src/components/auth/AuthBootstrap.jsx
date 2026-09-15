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
    restorePromise = reissue()
      .then((session) => {
        useAuthStore.getState().setSession(session);
      })
      .catch(() => {
        useAuthStore.getState().clearSession();
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

  return children;
}
