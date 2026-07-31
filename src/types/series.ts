// ============================================
// Series Types
// ============================================

import type { TMDBCastMember } from './movie';

export interface Series {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface SeriesDetails extends Series {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  seasons: Season[];
  status: string;
  tagline: string;
  homepage: string | null;
  created_by: { id: number; name: string }[];
  videos?: { results: { key: string; site: string; type: string }[] };
  credits?: { cast: TMDBCastMember[] };
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface SeriesDiscoverResponse {
  page: number;
  results: Series[];
  total_pages: number;
  total_results: number;
}
