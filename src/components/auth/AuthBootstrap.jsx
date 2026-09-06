import { useEffect } from 'react';
import { reissue } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';

let restorePromise = null;

function restoreSession() {
  if (!restorePromise) {
    restorePromise = reissue()
      .then(({ accessToken }) => {
        useAuthStore.getState().setSession(accessToken);
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
