
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        login: (token) => set({ token }),
        logout: () => set({ token: null }),
      }),
      { name: 'auth-storage' }
    )
  )
);
