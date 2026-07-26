// ============================================
// Firebase Service — Init & Config
// ============================================

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth, connectAuthEmulator, type Auth,
} from 'firebase/auth';
import {
  getDatabase, connectDatabaseEmulator, type Database,
} from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Environment variables (via Vite .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase — gracefully handle missing env vars
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

const missingKey = Object.entries(firebaseConfig).find(([, v]) => !v);

if (missingKey) {
  console.error(
    `Firebase config missing: ${missingKey[0]}. Set VITE_FIREBASE_* env vars in your Netlify site settings.`,
  );
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);

    // Emulator support (for development)
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectDatabaseEmulator(db, 'localhost', 9000);
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

// Analytics (conditional — fails gracefully if not supported)
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
if (app) {
  isSupported()
    .then((supported) => {
      if (supported) analyticsInstance = getAnalytics(app!);
    })
    .catch(() => {});
}
export const getAnalyticsInstance = () => analyticsInstance;

export { auth, db };
export default app;
