#!/usr/bin/env node
// ============================================
// Firebase Database Cleanup Script
// Checks and fixes malformed movie/series entries
//
// Usage:
//   node scripts/cleanup-firebase.mjs          # Dry run (report only)
//   node scripts/cleanup-firebase.mjs --fix     # Apply fixes
// ============================================

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPLY_FIXES = process.argv.includes('--fix');

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
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  } catch {
    console.error('Could not read .env file. Make sure it exists at project root.');
    process.exit(1);
  }
  return env;
}

// ---- Initialize Firebase ----
const env = loadEnv();
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.databaseURL) {
  console.error('VITE_FIREBASE_DATABASE_URL not found in .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---- Helpers ----
function isArray(v) {
  return Array.isArray(v);
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isNumber(v) {
  return typeof v === 'number' && !isNaN(v);
}

function isBoolean(v) {
  return typeof v === 'boolean';
}

function isString(v) {
  return typeof v === 'string';
}

// ---- Validate a single movie ----
function validateMovie(id, movie) {
  const issues = [];
  const fixes = {};

  // genres must be array
  if (!isArray(movie.genres)) {
    issues.push(`genres is ${typeof movie.genres} (expected array)`);
    fixes.genres = [];
  }

  // streamLinks must be array
  if (!isArray(movie.streamLinks)) {
    issues.push(`streamLinks is ${typeof movie.streamLinks} (expected array)`);
    fixes.streamLinks = [];
  }

  // rating must be number
  if (!isNumber(movie.rating)) {
    issues.push(`rating is ${typeof movie.rating} (expected number)`);
    fixes.rating = 0;
  }

  // featured must be boolean
  if (!isBoolean(movie.featured)) {
    issues.push(`featured is ${typeof movie.featured} (expected boolean)`);
    fixes.featured = false;
  }

  // title must be string
  if (!isString(movie.title)) {
    issues.push(`title is ${typeof movie.title} (expected string)`);
  }

  // overview should be string
  if (movie.overview !== undefined && !isString(movie.overview)) {
    issues.push(`overview is ${typeof movie.overview} (expected string)`);
    fixes.overview = '';
  }

  return { issues, fixes };
}

// ---- Validate a single series ----
function validateSeries(id, series) {
  const issues = [];
  const fixes = {};

  // genres must be array
  if (!isArray(series.genres)) {
    issues.push(`genres is ${typeof series.genres} (expected array)`);
    fixes.genres = [];
  }

  // seasons must be array
  if (!isArray(series.seasons)) {
    issues.push(`seasons is ${typeof series.seasons} (expected array)`);
    fixes.seasons = [];
  } else {
    // Check each season
    for (let si = 0; si < series.seasons.length; si++) {
      const season = series.seasons[si];
      if (!isObject(season)) {
        issues.push(`seasons[${si}] is not an object`);
        continue;
      }
      // season.episodes must be array
      if (!isArray(season.episodes)) {
        issues.push(`seasons[${si}].episodes is ${typeof season.episodes} (expected array)`);
        if (!fixes.seasons) fixes.seasons = [...(series.seasons || [])];
        fixes.seasons[si] = { ...fixes.seasons[si], episodes: [] };
      } else {
        // Check each episode
        for (let ei = 0; ei < season.episodes.length; ei++) {
          const ep = season.episodes[ei];
          if (!isObject(ep)) {
            issues.push(`seasons[${si}].episodes[${ei}] is not an object`);
            continue;
          }
          if (!isArray(ep.streamLinks)) {
            issues.push(`seasons[${si}].episodes[${ei}].streamLinks is ${typeof ep.streamLinks} (expected array)`);
            if (!fixes.seasons) fixes.seasons = [...(series.seasons || [])];
            if (!fixes.seasons[si]) fixes.seasons[si] = { ...series.seasons[si] };
            if (!fixes.seasons[si].episodes) fixes.seasons[si].episodes = [...(season.episodes || [])];
            fixes.seasons[si].episodes[ei] = { ...fixes.seasons[si].episodes[ei], streamLinks: [] };
          }
        }
      }
    }
  }

  // rating must be number
  if (!isNumber(series.rating)) {
    issues.push(`rating is ${typeof series.rating} (expected number)`);
    fixes.rating = 0;
  }

  // featured must be boolean
  if (!isBoolean(series.featured)) {
    issues.push(`featured is ${typeof series.featured} (expected boolean)`);
    fixes.featured = false;
  }

  // name must be string
  if (!isString(series.name)) {
    issues.push(`name is ${typeof series.name} (expected string)`);
  }

  return { issues, fixes };
}

// ---- Main ----
async function main() {
  console.log('=== Firebase Database Cleanup ===');
  console.log(`Mode: ${APPLY_FIXES ? 'FIX (will write changes)' : 'DRY RUN (no changes will be made)'}`);
  console.log(`Database: ${firebaseConfig.databaseURL}\n`);

  let totalIssues = 0;
  let totalFixed = 0;

  // --- Movies ---
  console.log('--- Movies ---');
  const moviesSnap = await get(ref(db, 'movies'));
  if (moviesSnap.exists()) {
    const movies = moviesSnap.val();
    const movieIds = Object.keys(movies);
    console.log(`Found ${movieIds.length} movies`);

    for (const id of movieIds) {
      const movie = movies[id];
      const { issues, fixes } = validateMovie(id, movie);
      if (issues.length > 0) {
        totalIssues += issues.length;
        console.log(`\n  [MOVIE] "${movie.title || '(no title)'}" (id: ${id}, tmdbId: ${movie.tmdbId})`);
        for (const issue of issues) {
          console.log(`    - ${issue}`);
        }
        if (APPLY_FIXES && Object.keys(fixes).length > 0) {
          await update(ref(db, `movies/${id}`), fixes);
          totalFixed += Object.keys(fixes).length;
          console.log(`    -> Fixed ${Object.keys(fixes).length} field(s)`);
        }
      }
    }
  } else {
    console.log('No movies found');
  }

  // --- Series ---
  console.log('\n--- Series ---');
  const seriesSnap = await get(ref(db, 'webseries'));
  if (seriesSnap.exists()) {
    const series = seriesSnap.val();
    const seriesIds = Object.keys(series);
    console.log(`Found ${seriesIds.length} series`);

    for (const id of seriesIds) {
      const s = series[id];
      const { issues, fixes } = validateSeries(id, s);
      if (issues.length > 0) {
        totalIssues += issues.length;
        console.log(`\n  [SERIES] "${s.name || '(no name)'}" (id: ${id}, tmdbId: ${s.tmdbId})`);
        for (const issue of issues) {
          console.log(`    - ${issue}`);
        }
        if (APPLY_FIXES && Object.keys(fixes).length > 0) {
          await update(ref(db, `webseries/${id}`), fixes);
          totalFixed += Object.keys(fixes).length;
          console.log(`    -> Fixed ${Object.keys(fixes).length} field(s)`);
        }
      }
    }
  } else {
    console.log('No series found');
  }

  // --- Summary ---
  console.log('\n=== Summary ===');
  console.log(`Total issues found: ${totalIssues}`);
  if (APPLY_FIXES) {
    console.log(`Total fields fixed: ${totalFixed}`);
  } else {
    console.log('Dry run complete. Run with --fix to apply changes:');
    console.log('  node scripts/cleanup-firebase.mjs --fix');
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
