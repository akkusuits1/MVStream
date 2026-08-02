#!/usr/bin/env node
// ============================================
// Firebase Write Permission Test
// Tests if the database allows write operations
//
// Usage: node scripts/test-db-write.mjs
// ============================================

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, remove } from 'firebase/database';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Load .env ----
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  const env = {};
  try {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  } catch {
    console.error('Could not read .env file.');
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getDatabase(app);

async function testWrite(path, data) {
  try {
    const r = ref(db, path);
    await set(r, data);
    console.log(`  [OK] Write to "${path}" succeeded`);
    await remove(r);
    console.log(`  [OK] Delete from "${path}" succeeded`);
    return true;
  } catch (err) {
    console.log(`  [FAIL] Write to "${path}" — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Firebase Write Test ===\n');

  const results = [];
  results.push(await testWrite('_test', { test: true, ts: Date.now() }));
  results.push(await testWrite('movies/_test', { title: 'Test' }));
  results.push(await testWrite('webseries/_test', { name: 'Test' }));
  results.push(await testWrite('categories/_test', { name: 'Test' }));

  console.log('\n=== Result ===');
  if (results.every(Boolean)) {
    console.log('All writes passed. Rules are permissive.');
  } else {
    console.log('Some writes FAILED. Check your Firebase Realtime Database rules.');
    console.log('Go to: Firebase Console > Realtime Database > Rules');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
