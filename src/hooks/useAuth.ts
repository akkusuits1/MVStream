// ============================================
// useAuth Hook — Auth state management
// ============================================

import { stores } from '@core/store';
import type { User } from '@types';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  subscribe: (callback: (user: User | null) => void) => () => void;
}

export function useAuth(): UseAuthReturn {
  return {
    get user() {
      return stores.user.get();
    },
    get loading() {
      return stores.authLoading.get();
    },
    get isAuthenticated() {
      return stores.user.get() !== null;
    },
    get isAdmin() {
      const user = stores.user.get();
      return user?.role === 'admin';
    },

    async signInWithGoogle() {
      const { signInWithGoogle } = await import('@services/auth');
      return signInWithGoogle();
    },

    async logout() {
      const { logout } = await import('@services/auth');
      return logout();
    },

    subscribe(callback: (user: User | null) => void) {
      return stores.user.subscribe(callback);
    },
  };
}
