// ============================================
// User Types
// ============================================

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  status: 'active' | 'pending' | 'banned';
  createdAt: number;
  lastLogin: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
