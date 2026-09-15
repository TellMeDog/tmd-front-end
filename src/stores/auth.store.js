import { create } from 'zustand';
import { usePetStore } from './pet.store';

export const useAuthStore = create((set) => ({
  accessToken: null,
  nickname: localStorage.getItem('tmd:nickname'),
  isAuthReady: false,
  isSessionExpired: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  setSession: (session) => {
    const accessToken = typeof session === 'string' ? session : session.accessToken;
    const nickname =
      typeof session === 'string'
        ? localStorage.getItem('tmd:nickname')
        : (session.nickname ?? session.name ?? localStorage.getItem('tmd:nickname'));
    if (nickname) localStorage.setItem('tmd:nickname', nickname);
    localStorage.setItem('tmd:has-session', 'true');
    localStorage.removeItem('tmd:signed-out');
    set((state) => ({
      accessToken,
      nickname: nickname ?? state.nickname,
      isAuthReady: true,
      isSessionExpired: false,
    }));
  },
  clearSession: ({ signedOut = false } = {}) => {
    usePetStore.getState().clearPets();
    localStorage.removeItem('tmd:nickname');
    localStorage.removeItem('tmd:has-session');
    if (signedOut) localStorage.setItem('tmd:signed-out', 'true');
    set({ accessToken: null, nickname: null, isAuthReady: true, isSessionExpired: false });
  },
  expireSession: () => {
    usePetStore.getState().clearPets();
    localStorage.removeItem('tmd:nickname');
    localStorage.removeItem('tmd:has-session');
    localStorage.setItem('tmd:signed-out', 'true');
    set({ accessToken: null, nickname: null, isAuthReady: true, isSessionExpired: true });
  },
}));
