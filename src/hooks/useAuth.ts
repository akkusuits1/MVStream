import { useStore } from '@/store/useStore';
import { signInWithGoogle as googleSignIn, logout as authLogout } from '@/services/auth';

export function useAuth() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const authLoading = useStore((s) => s.authLoading);

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading: authLoading,
    signInWithGoogle: googleSignIn,
    logout: authLogout,
  };
}
