// ============================================
// useAuth Hook — Auth state management
// ============================================

import { stores } from '@core/store';
import { events, EVENTS } from '@core/events';
import type { User } from '@types';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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

    async login(email: string, password: string) {
      const { login } = await import('@services/auth');
      return login(email, password);
    },

    async register(email: string, password: string, displayName: string) {
      const { register } = await import('@services/auth');
      return register(email, password, displayName);
    },

    async logout() {
      const { logout } = await import('@services/auth');
      return logout();
    },

    async resetPassword(email: string) {
      const { resetPassword } = await import('@services/auth');
      return resetPassword(email);
    },

    subscribe(callback: (user: User | null) => void) {
      return stores.user.subscribe(callback);
    },
  };
}