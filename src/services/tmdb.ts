// ============================================
// TMDB Service — The Movie Database API
// ============================================

import type { TMDBMovie, TMDBSeries, TMDBSeason, TMDBSearchResult, Movie, Series } from '@types';

export { tmdbImage } from '@core/utils';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// ---- Fetch helper ----
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ---- Image URLs ----
export function posterURL(
  path: string | null | undefined,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500',
): string {
  if (!path) return '/placeholder-poster.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropURL(
  path: string | null | undefined,
  size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
): string {
  if (!path) return '/placeholder-backdrop.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileURL(
  path: string | null | undefined,
  size: 'w45' | 'w185' | 'h632' | 'original' = 'w185',
): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// ---- Search ----
export async function searchMulti(query: string): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/search/multi', {
    query,
    include_adult: 'false',
  });
}

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/search/movie', {
    query,
    page: String(page),
    include_adult: 'false',
  });
}

export async function searchSeries(query: string, page = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/search/tv', {
    query,
    page: String(page),
    include_adult: 'false',
  });
}

// ---- Trending ----
export async function trendingAll(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/trending/all/${timeWindow}`);
}

export async function trendingMovies(
  timeWindow: 'day' | 'week' = 'week',
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/trending/movie/${timeWindow}`);
}

export async function trendingSeries(
  timeWindow: 'day' | 'week' = 'week',
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/trending/tv/${timeWindow}`);
}

// ---- Discover ----
export async function discoverMovies(
  params: Record<string, string> = {},
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/discover/movie', {
    sort_by: 'popularity.desc',
    ...params,
  });
}

export async function discoverSeries(
  params: Record<string, string> = {},
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/discover/tv', {
    sort_by: 'popularity.desc',
    ...params,
  });
}

// ---- Details ----
export async function getMovieDetails(id: number): Promise<TMDBMovie> {
  return tmdbFetch<TMDBMovie>(`/movie/${id}`, {
    append_to_response: 'credits,videos,similar',
  });
}

export async function getSeriesDetails(id: number): Promise<TMDBSeries> {
  return tmdbFetch<TMDBSeries>(`/tv/${id}`, {
    append_to_response: 'credits,videos,similar',
  });
}

export async function getSeasonDetails(
  seriesId: number,
  seasonNumber: number,
): Promise<
  TMDBSeason & {
    episodes: {
      id: number;
      episode_number: number;
      name: string;
      overview: string;
      still_path: string | null;
      runtime: number;
      vote_average: number;
    }[];
  }
> {
  return tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`);
}

// ---- Convert TMDB movie to app Movie ----
export function tmdbToMovie(
  tmdb: TMDBMovie,
): Omit<Movie, 'servers' | 'views' | 'createdAt' | 'updatedAt'> {
  return {
    id: String(tmdb.id),
    title: tmdb.title,
    description: tmdb.overview,
    backdrop: tmdb.backdrop_path || '',
    poster: tmdb.poster_path || '',
    year: tmdb.release_date ? parseInt(tmdb.release_date.slice(0, 4)) : 0,
    rating: tmdb.vote_average,
    duration: tmdb.runtime ? `${tmdb.runtime} min` : 'N/A',
    genres: tmdb.genres?.map((g) => g.name) || [],
    category: tmdb.genres?.[0]?.name || 'Movie',
    tmdbId: tmdb.id,
    trailer: tmdb.videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key,
    cast: tmdb.credits?.cast.slice(0, 10).map((c) => c.name),
    director: tmdb.credits?.crew.find((c) => c.job === 'Director')?.name,
  };
}

// ---- Convert TMDB series to app Series ----
export function tmdbToSeries(
  tmdb: TMDBSeries,
): Omit<Series, 'servers' | 'views' | 'createdAt' | 'updatedAt'> {
  return {
    id: String(tmdb.id),
    title: tmdb.name,
    description: tmdb.overview,
    backdrop: tmdb.backdrop_path || '',
    poster: tmdb.poster_path || '',
    year: tmdb.first_air_date ? parseInt(tmdb.first_air_date.slice(0, 4)) : 0,
    rating: tmdb.vote_average,
    seasons: [],
    genres: tmdb.genres?.map((g) => g.name) || [],
    category: tmdb.genres?.[0]?.name || 'Series',
    tmdbId: tmdb.id,
    trailer: tmdb.videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key,
    cast: tmdb.credits?.cast.slice(0, 10).map((c) => c.name),
    creator: tmdb.created_by?.map((c) => c.name).join(', '),
    status: tmdb.status === 'Returning Series' ? 'ongoing' : 'completed',
  };
}

// ---- YouTube trailer URL ----
export function youtubeTrailerURL(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`;
}

export function youtubeThumbnail(videoKey: string): string {
  return `https://img.youtube.com/vi/${videoKey}/hqdefault.jpg`;
}
