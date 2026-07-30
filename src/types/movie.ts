// ============================================
// Movie Types
// ============================================

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  videos?: { results: { key: string; site: string; type: string }[] };
  credits?: { cast: TMDBCastMember[] };
}

export interface MovieDiscoverResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TrendingResponse {
  page: number;
  results: (Movie | Series)[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

// Re-export Series for use in TrendingResponse
import type { Series } from './series';

export type TrendingItem = (Movie & { media_type?: 'movie' }) | (Series & { media_type?: 'tv' });
