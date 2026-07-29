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
import { stores } from '@core/store';
import { events, EVENTS } from '@core/events';
import type { User } from '@types';

// ---- State ----
let unsubAuth: (() => void) | null = null;
let unsubUser: (() => void) | null = null;

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
export function initAuth(): void {
  const firebaseAuth = requireAuth();
  if (!firebaseAuth) {
    stores.authLoading.set(false);
    return;
  }
  stores.authLoading.set(true);

  unsubAuth = onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      listenToUserProfile(firebaseUser.uid);
    } else {
      stores.user.set(null);
      stores.authLoading.set(false);
      unsubUser?.();
    }
  });
}

// ---- Listen to user profile in DB ----
function listenToUserProfile(uid: string): void {
  unsubUser?.();

  const firebaseAuth = requireAuth();
  const database = requireDb();
  if (!firebaseAuth || !database) return;
  const userRef = ref(database, `users/${uid}`);
  unsubUser = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const user: User = {
        uid,
        email: data.email || firebaseAuth.currentUser?.email || '',
        displayName: data.displayName || firebaseAuth.currentUser?.displayName || 'User',
        photoURL: data.photoURL || firebaseAuth.currentUser?.photoURL || undefined,
        role: data.role || 'user',
        status: data.status || 'active',
        createdAt: data.createdAt || Date.now(),
        lastLogin: Date.now(),
      };
      stores.user.set(user);
    } else {
      // Create user profile if doesn't exist
      const newUser: User = {
        uid,
        email: firebaseAuth.currentUser?.email || '',
        displayName: firebaseAuth.currentUser?.displayName || 'User',
        photoURL: firebaseAuth.currentUser?.photoURL || undefined,
        role: 'user',
        status: 'active',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };
      set(userRef, newUser);
      stores.user.set(newUser);
    }
    stores.authLoading.set(false);
    events.emit(EVENTS.AUTH_LOGIN, stores.user.get());
  });
}

// ---- Google Sign-In ----
export async function signInWithGoogle(): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  if (!firebaseAuth || !database) throw new Error('Firebase is not configured.');
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    // Update last login
    const userRef = ref(database, `users/${result.user.uid}/lastLogin`);
    await set(userRef, Date.now());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google sign-in failed';
    events.emit(EVENTS.AUTH_ERROR, message);
    throw error;
  }
}

// ---- Logout ----
export async function logout(): Promise<void> {
  const firebaseAuth = requireAuth();
  if (!firebaseAuth) return;
  try {
    unsubUser?.();
    await signOut(firebaseAuth);
    stores.user.set(null);
    events.emit(EVENTS.AUTH_LOGOUT);
  } catch (error: unknown) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// ---- Check if user is admin ----
export function isAdmin(): boolean {
  const user = stores.user.get();
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

// ---- Cleanup ----
export function cleanupAuth(): void {
  unsubAuth?.();
  unsubUser?.();
}
