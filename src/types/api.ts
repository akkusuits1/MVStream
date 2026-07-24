// ============================================
// API & External Service Type Definitions
// ============================================

// ---- TMDB API Response Types ----

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
  tagline?: string;
  credits?: TMDBCredits;
  videos?: { results: TMDBVideo[] };
  similar?: { results: TMDBMovie[] };
  production_companies?: { id: number; name: string }[];
  spoken_languages?: { english_name: string }[];
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  seasons?: TMDBSeason[];
  credits?: TMDBCredits;
  videos?: { results: TMDBVideo[] };
  created_by?: { id: number; name: string }[];
  spoken_languages?: { english_name: string }[];
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
  vote_average: number;
  season_number: number;
}

export interface TMDBCredits {
  cast: { id: number; name: string; character: string; profile_path: string | null }[];
  crew: { id: number; name: string; job: string }[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TMDBSearchResult {
  page: number;
  results: (TMDBMovie | TMDBSeries)[];
  total_results: number;
  total_pages: number;
}

// ---- Ad System Types ----

export interface AdConfig {
  enabled: boolean;
  bannerZoneId: string;
  interstitialZoneId: string;
  pushZoneId: string;
  interstitialInterval: number; // seconds between interstitials
}

export interface Ad {
  id: string;
  type: 'banner' | 'interstitial' | 'video';
  url: string;
  imageUrl?: string;
  zoneId: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

// ---- App Settings (Firebase /settings node) ----

export interface AppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  tmdbApiKey: string;
  ads: AdConfig;
  appVersion: string;
  updatedAt: number;
}

// ---- Report ----

export interface ContentReport {
  id: string;
  type: 'broken-link' | 'content-request';
  userId?: string;
  userName?: string;
  contentId?: string;
  contentTitle?: string;
  seasonId?: string;
  episodeId?: string;
  serverName?: string;
  serverUrl?: string;
  message: string;
  contactEmail?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedAt?: number;
}