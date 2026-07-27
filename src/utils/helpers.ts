// ============================================
// Helper Functions
// ============================================

import type { Movie, Series } from '@types';
import { ref, get, set, push } from 'firebase/database';
import { db } from '@services/firebase';

// ---- Firebase Data Helpers ----

function requireDb(): NonNullable<typeof db> | null {
  if (!db) {
    console.warn('Firebase is not configured. Some features may be unavailable.');
    return null;
  }
  return db;
}

/**
 * Fetch all movies from Firebase
 */
export async function fetchMovies(): Promise<Movie[]> {
  const database = requireDb();
  if (!database) return [];
  const moviesRef = ref(database, 'movies');
  const snapshot = await get(moviesRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, Movie>;
  return Object.entries(data).map(([id, movie]) => ({
    ...movie,
    id,
  }));
}

/**
 * Fetch all series from Firebase
 */
export async function fetchSeries(): Promise<Series[]> {
  const database = requireDb();
  if (!database) return [];
  const seriesRef = ref(database, 'series');
  const snapshot = await get(seriesRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, Series>;
  return Object.entries(data).map(([id, series]) => ({
    ...series,
    id,
  }));
}

/**
 * Fetch a single movie by ID
 */
export async function fetchMovieById(id: string): Promise<Movie | null> {
  const database = requireDb();
  if (!database) return null;
  const movieRef = ref(database, `movies/${id}`);
  const snapshot = await get(movieRef);

  if (!snapshot.exists()) return null;

  return { ...snapshot.val(), id } as Movie;
}

/**
 * Fetch a single series by ID
 */
export async function fetchSeriesById(id: string): Promise<Series | null> {
  const database = requireDb();
  if (!database) return null;
  const seriesRef = ref(database, `series/${id}`);
  const snapshot = await get(seriesRef);

  if (!snapshot.exists()) return null;

  return { ...snapshot.val(), id } as Series;
}

/**
 * Fetch categories from Firebase
 */
export async function fetchCategories(): Promise<
  { id: string; name: string; slug: string; icon?: string; order?: number }[]
> {
  const database = requireDb();
  if (!database) return [];
  const catRef = ref(database, 'categories');
  const snapshot = await get(catRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<
    string,
    { name: string; slug: string; icon?: string; order?: number }
  >;
  return Object.entries(data)
    .map(([id, cat]) => ({ id, ...cat }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Fetch app settings from Firebase
 */
export async function fetchSettings(): Promise<Record<string, unknown> | null> {
  const database = requireDb();
  if (!database) return null;
  const settingsRef = ref(database, 'settings');
  const snapshot = await get(settingsRef);
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * Increment view count
 */
export async function incrementViews(type: 'movies' | 'series', id: string): Promise<void> {
  const database = requireDb();
  if (!database) return;
  const itemRef = ref(database, `${type}/${id}/views`);
  const snapshot = await get(itemRef);
  const currentViews = snapshot.val() || 0;
  await set(itemRef, currentViews + 1);
}

/**
 * Submit a report (broken link or content request)
 */
export async function submitReport(report: {
  type: 'broken-link' | 'content-request';
  userId?: string;
  contentId?: string;
  contentTitle?: string;
  message: string;
  contactEmail?: string;
}): Promise<string> {
  const database = requireDb();
  if (!database) throw new Error('Firebase is not configured.');
  const reportsRef = ref(database, 'reports');
  const newRef = push(reportsRef);
  await set(newRef, {
    ...report,
    status: 'pending',
    createdAt: Date.now(),
  });
  return newRef.key!;
}

// ---- String Helpers ----

/**
 * Create a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract year from date string
 */
export function extractYear(dateStr: string): number {
  if (!dateStr) return 0;
  return parseInt(dateStr.slice(0, 4)) || 0;
}

/**
 * Get content type from a movie/series object
 */
export function getContentType(item: Movie | Series): 'movie' | 'series' {
  return 'seasons' in item ? 'series' : 'movie';
}

/**
 * Group items by category
 */
export function groupByCategory<T extends { category: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const category = item.category || 'Uncategorized';
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push(item);
  }
  return grouped;
}

/**
 * Filter items by search query
 */
export function filterByQuery<T extends { title: string }>(items: T[], query: string): T[] {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      ('genres' in item &&
        (item as T & { genres: string[] }).genres.some((g) => g.toLowerCase().includes(q))),
  );
}

/**
 * Sort items by key
 */
export function sortBy<T>(items: T[], key: keyof T, direction: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return direction === 'asc' ? cmp : -cmp;
  });
}

/**
 * Random shuffle array (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get top N items from array
 */
export function topN<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type for responsive layout
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
