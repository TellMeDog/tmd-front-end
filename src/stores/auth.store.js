import { create } from 'zustand';
import { usePetStore } from './pet.store';

export const useAuthStore = create((set) => ({
  accessToken: null,
  isAuthReady: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  setSession: (accessToken) => set({ accessToken, isAuthReady: true }),
  clearSession: () => {
    usePetStore.getState().clearPets();
    set({ accessToken: null, isAuthReady: true });
  },
}));
