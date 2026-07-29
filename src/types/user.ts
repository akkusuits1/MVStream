// ============================================
// User & Auth Type Definitions
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
  error: string | null;
}

// ---- Firebase User DB Schema ----
// /users/{uid}
//   displayName: string
//   email: string
//   role: 'user' | 'admin'
//   status: 'active' | 'pending' | 'banned'
//   createdAt: number (timestamp)
//   lastLogin: number (timestamp)

// ---- Report Types ----

export interface Report {
  id: string;
  type: 'broken-link' | 'content-request';
  userId?: string;
  contentId?: string;
  contentTitle?: string;
  message: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedAt?: number;
}
