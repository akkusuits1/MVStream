// ============================================
// Content Service — Firebase CRUD for movies, series, categories
// ============================================

import { ref, push, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from './firebase';
import type { StreamLink } from './player';

// ---- Types ----
export interface FirebaseMovie {
  id?: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  rating: number;
  genres: string[];
  featured: boolean;
  streamLinks: StreamLink[];
  createdAt: number;
  updatedAt: number;
}

export interface FirebaseSeries {
  id?: string;
  tmdbId: number;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string;
  rating: number;
  genres: string[];
  featured: boolean;
  seasons: SeriesSeason[];
  createdAt: number;
  updatedAt: number;
}

export interface SeriesSeason {
  number: number;
  name: string;
  episodes: SeasonEpisode[];
}

export interface SeasonEpisode {
  number: number;
  name: string;
  streamLinks: StreamLink[];
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  contentIds: string[];
  createdAt: number;
}

// ---- Constants ----
const MOVIES_PATH = 'movies';
const SERIES_PATH = 'webseries';
const CATEGORIES_PATH = 'categories';
const SETTINGS_PATH = 'settings';

// ---- Movies CRUD ----
export async function addMovie(data: Omit<FirebaseMovie, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const moviesRef = ref(db, MOVIES_PATH);
  const newRef = await push(moviesRef, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateMovie(id: string, data: Partial<FirebaseMovie>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const movieRef = ref(db, `${MOVIES_PATH}/${id}`);
  await update(movieRef, { ...data, updatedAt: Date.now() });
}

export async function deleteMovie(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const movieRef = ref(db, `${MOVIES_PATH}/${id}`);
  await remove(movieRef);
}

export async function getMovies(): Promise<FirebaseMovie[]> {
  if (!db) return [];
  const moviesRef = ref(db, MOVIES_PATH);
  const snapshot = await get(moviesRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, val]) => ({
    id,
    ...(val as Omit<FirebaseMovie, 'id'>),
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getMovieByTmdbId(tmdbId: number): Promise<FirebaseMovie | null> {
  if (!db) return null;
  const moviesRef = ref(db, MOVIES_PATH);
  const q = query(moviesRef, orderByChild('tmdbId'), equalTo(tmdbId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return null;
  const entry = Object.entries(snapshot.val())[0];
  return { id: entry[0], ...(entry[1] as Omit<FirebaseMovie, 'id'>) };
}

// ---- Series CRUD ----
export async function addSeries(data: Omit<FirebaseSeries, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const seriesRef = ref(db, SERIES_PATH);
  const newRef = await push(seriesRef, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateSeries(id: string, data: Partial<FirebaseSeries>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const seriesRef = ref(db, `${SERIES_PATH}/${id}`);
  await update(seriesRef, { ...data, updatedAt: Date.now() });
}

export async function deleteSeries(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const seriesRef = ref(db, `${SERIES_PATH}/${id}`);
  await remove(seriesRef);
}

export async function getSeries(): Promise<FirebaseSeries[]> {
  if (!db) return [];
  const seriesRef = ref(db, SERIES_PATH);
  const snapshot = await get(seriesRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, val]) => ({
    id,
    ...(val as Omit<FirebaseSeries, 'id'>),
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSeriesByTmdbId(tmdbId: number): Promise<FirebaseSeries | null> {
  if (!db) return null;
  const seriesRef = ref(db, SERIES_PATH);
  const q = query(seriesRef, orderByChild('tmdbId'), equalTo(tmdbId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return null;
  const entry = Object.entries(snapshot.val())[0];
  return { id: entry[0], ...(entry[1] as Omit<FirebaseSeries, 'id'>) };
}

// ---- Categories CRUD ----
export async function addCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const categoriesRef = ref(db, CATEGORIES_PATH);
  const newRef = await push(categoriesRef, {
    ...data,
    createdAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const categoryRef = ref(db, `${CATEGORIES_PATH}/${id}`);
  await update(categoryRef, data);
}

export async function deleteCategory(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const categoryRef = ref(db, `${CATEGORIES_PATH}/${id}`);
  await remove(categoryRef);
}

export async function getCategories(): Promise<Category[]> {
  if (!db) return [];
  const categoriesRef = ref(db, CATEGORIES_PATH);
  const snapshot = await get(categoriesRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, val]) => ({
    id,
    ...(val as Omit<Category, 'id'>),
  }));
}

// ---- Settings ----
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  defaultPlayer: string;
  defaultQuality: string;
  adsEnabled: boolean;
  tmdbApiKey: string;
  heroBannerItems: { tmdbId: number; type: 'movie' | 'series' }[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'MVStream',
  siteDescription: 'Watch movies and series for free',
  maintenanceMode: false,
  defaultPlayer: 'auto',
  defaultQuality: 'auto',
  adsEnabled: false,
  tmdbApiKey: '',
  heroBannerItems: [],
};

export async function getSettings(): Promise<SiteSettings> {
  if (!db) return DEFAULT_SETTINGS;
  const settingsRef = ref(db, SETTINGS_PATH);
  const snapshot = await get(settingsRef);
  if (!snapshot.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snapshot.val() as Partial<SiteSettings>) };
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const settingsRef = ref(db, SETTINGS_PATH);
  await update(settingsRef, data);
}

// ---- Dashboard Stats ----
export async function getDashboardStats(): Promise<{
  totalMovies: number;
  totalSeries: number;
  totalCategories: number;
  totalUsers: number;
  pendingRequests: number;
  featuredMovies: number;
  featuredSeries: number;
}> {
  if (!db) return { totalMovies: 0, totalSeries: 0, totalCategories: 0, totalUsers: 0, pendingRequests: 0, featuredMovies: 0, featuredSeries: 0 };

  const [moviesSnap, seriesSnap, categoriesSnap, usersSnap, requestsSnap] = await Promise.all([
    get(ref(db, MOVIES_PATH)),
    get(ref(db, SERIES_PATH)),
    get(ref(db, CATEGORIES_PATH)),
    get(ref(db, 'users')),
    get(ref(db, 'movieRequests')),
  ]);

  const moviesData = moviesSnap.exists() ? moviesSnap.val() : {};
  const seriesData = seriesSnap.exists() ? seriesSnap.val() : {};

  return {
    totalMovies: moviesSnap.exists() ? Object.keys(moviesData).length : 0,
    totalSeries: seriesSnap.exists() ? Object.keys(seriesData).length : 0,
    totalCategories: categoriesSnap.exists() ? Object.keys(categoriesSnap.val()).length : 0,
    totalUsers: usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0,
    pendingRequests: requestsSnap.exists()
      ? Object.values(requestsSnap.val() as Record<string, { status: string }>).filter((r) => r.status === 'pending').length
      : 0,
    featuredMovies: moviesSnap.exists()
      ? Object.values(moviesData as Record<string, { featured: boolean }>).filter((m) => m.featured).length
      : 0,
    featuredSeries: seriesSnap.exists()
      ? Object.values(seriesData as Record<string, { featured: boolean }>).filter((s) => s.featured).length
      : 0,
  };
}
