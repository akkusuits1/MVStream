// ============================================
// Movie & Series Type Definitions
// ============================================

export interface Movie {
  id: string;
  title: string;
  description: string;
  backdrop: string;
  poster: string;
  year: number;
  rating: number;
  duration: string;
  genres: string[];
  category: string;
  servers: ServerLink[];
  trailer?: string;
  cast?: string[];
  director?: string;
  tmdbId?: number;
  views: number;
  createdAt: number;
  updatedAt: number;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  backdrop: string;
  poster: string;
  year: number;
  rating: number;
  seasons: Season[];
  genres: string[];
  category: string;
  trailer?: string;
  cast?: string[];
  creator?: string;
  tmdbId?: number;
  views: number;
  status: 'ongoing' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  description?: string;
  poster?: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration: string;
  thumbnail?: string;
  servers: ServerLink[];
  views: number;
}

export interface ServerLink {
  id: string;
  name: string;
  url: string;
  quality?: 'SD' | 'HD' | 'FHD' | '4K';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order?: number;
}

// ---- View/Watch State ----

export interface WatchHistoryItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  poster: string;
  backdrop?: string;
  seasonId?: string;
  episodeId?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  progress: number; // 0-100 percentage
  timestamp: number;
}

export interface WatchlistItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  poster: string;
  backdrop?: string;
  year?: number;
  rating?: number;
  addedAt: number;
}

export interface ContinueWatchingItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  poster: string;
  backdrop?: string;
  serverId?: string;
  serverName?: string;
  seasonId?: string;
  episodeId?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  progress: number;
  duration: number;
  timestamp: number;
}
