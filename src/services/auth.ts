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
import { ref, set, update, onValue, get } from 'firebase/database';
import { auth, db } from './firebase';
import { stores } from '@core/store';
import { events, EVENTS } from '@core/events';
import type { User } from '@types';

// ---- State ----
let unsubAuth: (() => void) | null = null;
let unsubUser: (() => void) | null = null;

// ---- Initialize auth listener ----
export function initAuth(): void {
  stores.authLoading.set(true);

  unsubAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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

  const userRef = ref(db, `users/${uid}`);
  unsubUser = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const user: User = {
        uid,
        email: data.email || auth.currentUser?.email || '',
        displayName: data.displayName || auth.currentUser?.displayName || 'User',
        photoURL: data.photoURL || auth.currentUser?.photoURL || undefined,
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
        email: auth.currentUser?.email || '',
        displayName: auth.currentUser?.displayName || 'User',
        photoURL: auth.currentUser?.photoURL || undefined,
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
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Update last login
    const userRef = ref(db, `users/${result.user.uid}/lastLogin`);
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
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile
    await updateProfile(result.user, { displayName });

    // Create user profile in DB
    const userRef = ref(db, `users/${result.user.uid}`);
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
  try {
    unsubUser?.();
    await signOut(auth);
    stores.user.set(null);
    events.emit(EVENTS.AUTH_LOGOUT);
  } catch (error: unknown) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// ---- Reset Password ----
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

// ---- Update Profile ----
export async function updateUserProfile(
  data: Partial<{ displayName: string; photoURL: string }>,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  if (data.displayName || data.photoURL) {
    await updateProfile(user, data);
  }

  const userRef = ref(db, `users/${user.uid}`);
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
