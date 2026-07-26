// ============================================
// Auth Service — Firebase Auth wrapper
// ============================================

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, set, update, onValue } from 'firebase/database';
import { auth, db } from './firebase';
import { stores } from '@core/store';
import { events, EVENTS } from '@core/events';
import type { User } from '@types';

// ---- State ----
let unsubAuth: (() => void) | null = null;
let unsubUser: (() => void) | null = null;

// ---- Null guards ----
function requireAuth(): NonNullable<typeof auth> {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  return auth;
}

function requireDb(): NonNullable<typeof db> {
  if (!db) throw new Error('Firebase Database is not configured.');
  return db;
}

// ---- Initialize auth listener ----
export function initAuth(): void {
  const firebaseAuth = requireAuth();
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

// ---- Login ----
export async function login(email: string, password: string): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  try {
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    // Update last login
    const userRef = ref(database, `users/${result.user.uid}/lastLogin`);
    await set(userRef, Date.now());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    events.emit(EVENTS.AUTH_ERROR, message);
    throw error;
  }
}

// ---- Register ----
export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  try {
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    // Update profile
    await updateProfile(result.user, { displayName });

    // Create user profile in DB
    const userRef = ref(database, `users/${result.user.uid}`);
    const newUser: User = {
      uid: result.user.uid,
      email,
      displayName,
      role: 'user',
      status: 'active',
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    await set(userRef, newUser);

    events.emit(EVENTS.AUTH_REGISTER, newUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    events.emit(EVENTS.AUTH_ERROR, message);
    throw error;
  }
}

// ---- Logout ----
export async function logout(): Promise<void> {
  const firebaseAuth = requireAuth();
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

// ---- Reset Password ----
export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = requireAuth();
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
  } catch (error: unknown) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

// ---- Update Profile ----
export async function updateUserProfile(
  data: Partial<{ displayName: string; photoURL: string }>,
): Promise<void> {
  const firebaseAuth = requireAuth();
  const database = requireDb();
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (data.displayName || data.photoURL) {
    await updateProfile(user, data);
  }

  const userRef = ref(database, `users/${user.uid}`);
  await update(userRef, data);
}

// ---- Check if user is admin ----
export function isAdmin(): boolean {
  const user = stores.user.get();
  return user?.role === 'admin';
}

// ---- Cleanup ----
export function cleanupAuth(): void {
  unsubAuth?.();
  unsubUser?.();
}
