// ============================================
// Auth Service — Firebase Auth wrapper (Google Sign-In)
// ============================================

import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, update, onValue, get } from 'firebase/database';
import { auth, db } from './firebase';
import type { User } from '@/types';

// ---- Null guards ----
function requireAuth(): NonNullable<typeof auth> | null {
  if (!auth) {
    console.warn('Firebase Auth is not configured. Auth features may be unavailable.');
    return null;
  }
  return auth;
}

function requireDb(): NonNullable<typeof db> | null {
  if (!db) {
    console.warn('Firebase Database is not configured. Some features may be unavailable.');
    return null;
  }
  return db;
}

// ---- Initialize auth listener ----
// Returns an unsubscribe function and accepts callbacks for state changes
export function initAuth(
  onUser: (user: User | null) => void,
  onLoading: (loading: boolean) => void,
): () => void {
  const firebaseAuth = requireAuth();
  if (!firebaseAuth) {
    onLoading(false);
    return () => {};
  }
  onLoading(true);

  let unsubUser: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // Listen to user profile in DB
      unsubUser?.();
      const database = requireDb();
      if (!database) {
        onUser(null);
        onLoading(false);
        return;
      }
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      unsubUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const user: User = {
            uid: firebaseUser.uid,
            email: data.email || firebaseUser.email || '',
            displayName: data.displayName || firebaseUser.displayName || 'User',
            photoURL: data.photoURL || firebaseUser.photoURL || undefined,
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt || Date.now(),
            lastLogin: Date.now(),
          };
          onUser(user);
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'user',
            status: 'active',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
          set(userRef, newUser);
          onUser(newUser);
        }
        onLoading(false);
      });
    } else {
      onUser(null);
      onLoading(false);
      unsubUser?.();
    }
  });

  return () => {
    unsubAuth();
    unsubUser?.();
  };
}

// ---- Google Sign-In ----
export async function signInWithGoogle(): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  if (!firebaseAuth || !database) throw new Error('Firebase is not configured.');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  const userRef = ref(database, `users/${result.user.uid}/lastLogin`);
  await set(userRef, Date.now());
}

// ---- Logout ----
export async function logout(): Promise<void> {
  const firebaseAuth = requireAuth();
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

// ---- Check if user is admin ----
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// ---- Admin: Fetch all users ----
export async function fetchAllUsers(): Promise<User[]> {
  const database = requireDb();
  if (!database) throw new Error('Firebase is not configured.');
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([uid, val]) => {
    const u = val as Record<string, unknown>;
    return {
      uid,
      email: (u.email as string) || '',
      displayName: (u.displayName as string) || 'User',
      photoURL: (u.photoURL as string) || undefined,
      role: (u.role as 'user' | 'admin') || 'user',
      status: (u.status as 'active' | 'pending' | 'banned') || 'active',
      createdAt: (u.createdAt as number) || 0,
      lastLogin: (u.lastLogin as number) || 0,
    };
  });
}

// ---- Admin: Update user role ----
export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  const database = requireDb();
  if (!database) throw new Error('Firebase is not configured.');
  const userRef = ref(database, `users/${uid}/role`);
  await set(userRef, role);
}

// ---- Admin: Update user status ----
export async function updateUserStatus(
  uid: string,
  status: 'active' | 'pending' | 'banned',
): Promise<void> {
  const database = requireDb();
  if (!database) throw new Error('Firebase is not configured.');
  const userRef = ref(database, `users/${uid}/status`);
  await set(userRef, status);
}

// ---- Update Profile ----
export async function updateUserProfile(
  data: Partial<{ displayName: string; photoURL: string }>,
): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  if (!firebaseAuth || !database) throw new Error('Firebase is not configured.');
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const userRef = ref(database, `users/${user.uid}`);
  await update(userRef, data);
}
