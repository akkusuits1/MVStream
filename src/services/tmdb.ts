// ============================================
// TMDB API Service
// ============================================

import type {
  MovieDetails,
  MovieDiscoverResponse,
  SeriesDetails,
  SeriesDiscoverResponse,
  TrendingResponse,
  Episode,
} from '@/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;

// ---- URL builders ----
export function posterURL(path: string | null, size: 'w92' | 'w200' | 'w342' | 'w500' | 'original' = 'w342'): string {
  if (!path) return '';
  return `${TMDB_IMG}/${size}${path}`;
}

export function backdropURL(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '';
  return `${TMDB_IMG}/${size}${path}`;
}

export function profileURL(path: string | null, size: 'w45' | 'w185' | 'original' = 'w185'): string {
  if (!path) return '';
  return `${TMDB_IMG}/${size}${path}`;
}

// ---- Fetch helpers ----
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json() as Promise<T>;
}

// ---- Discover ----
export async function discoverMovies(
  page = 1,
  sortBy = 'popularity.desc',
  withGenres = '',
): Promise<MovieDiscoverResponse> {
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortBy,
    include_adult: 'false',
    language: 'en-US',
  };
  if (withGenres) params.with_genres = withGenres;
  return tmdbFetch<MovieDiscoverResponse>('/discover/movie', params);
}

export async function discoverSeries(
  page = 1,
  sortBy = 'popularity.desc',
  withGenres = '',
): Promise<SeriesDiscoverResponse> {
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortBy,
    include_adult: 'false',
    language: 'en-US',
  };
  if (withGenres) params.with_genres = withGenres;
  return tmdbFetch<SeriesDiscoverResponse>('/discover/tv', params);
}

// ---- Trending ----
export async function trendingAll(timeWindow: 'day' | 'week' = 'week'): Promise<TrendingResponse> {
  return tmdbFetch<TrendingResponse>(`/trending/all/${timeWindow}`);
}

export async function trendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<MovieDiscoverResponse> {
  return tmdbFetch<MovieDiscoverResponse>(`/trending/movie/${timeWindow}`);
}

export async function trendingSeries(timeWindow: 'day' | 'week' = 'week'): Promise<SeriesDiscoverResponse> {
  return tmdbFetch<SeriesDiscoverResponse>(`/trending/tv/${timeWindow}`);
}

// ---- Details ----
export async function movieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${id}`, { append_to_response: 'videos,credits' });
}

export async function seriesDetails(id: number): Promise<SeriesDetails> {
  return tmdbFetch<SeriesDetails>(`/tv/${id}`, { append_to_response: 'videos,credits' });
}

// ---- Search ----
export async function searchMovies(query: string, page = 1): Promise<MovieDiscoverResponse> {
  return tmdbFetch<MovieDiscoverResponse>('/search/movie', { query, page: String(page) });
}

export async function searchSeries(query: string, page = 1): Promise<SeriesDiscoverResponse> {
  return tmdbFetch<SeriesDiscoverResponse>('/search/tv', { query, page: String(page) });
}

// ---- Season Details ----
export async function seasonDetails(
  seriesId: number,
  seasonNumber: number,
): Promise<{ episodes: Episode[] }> {
  return tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`);
}

// ---- Genre Lists ----
export async function movieGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
  return data.genres;
}

export async function seriesGenres(): Promise<{ id: number; name: string }[]> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/tv/list');
  return data.genres;
}
