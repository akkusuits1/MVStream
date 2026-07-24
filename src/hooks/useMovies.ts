// ============================================
// useMovies Hook — Movie/Series data management
// ============================================

import { stores } from '@core/store';
import type { Movie, Series, ContinueWatchingItem, WatchlistItem } from '@types';
import {
  getContinueWatching,
  addToContinueWatching,
  removeFromContinueWatching,
  getWatchHistory,
  addToWatchHistory,
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from '@services/storage';
import { fetchMovies, fetchSeries, fetchCategories, incrementViews } from '@utils/helpers';

export interface UseMoviesReturn {
  // Data
  movies: Movie[];
  series: Series[];
  categories: { id: string; name: string; slug: string }[];
  continueWatching: ContinueWatchingItem[];
  watchlist: WatchlistItem[];
  watchHistory: { id: string; type: 'movie' | 'series'; title: string; poster: string; timestamp: number }[];

  // Loading
  moviesLoading: boolean;
  seriesLoading: boolean;

  // Actions
  loadMovies: () => Promise<void>;
  loadSeries: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadUserData: () => void;
  playContent: (type: 'movie' | 'series', id: string) => Promise<void>;
  toggleWatchlist: (item: WatchlistItem) => void;
  isWatchlisted: (id: string, type: 'movie' | 'series') => boolean;
  refreshData: () => Promise<void>;

  // Subscribe
  subscribeMovies: (cb: (movies: Movie[]) => void) => () => void;
  subscribeSeries: (cb: (series: Series[]) => void) => () => void;
}

export function useMovies(): UseMoviesReturn {
  return {
    get movies() {
      return stores.movies.get();
    },
    get series() {
      return stores.series.get();
    },
    get categories() {
      return stores.categories.get();
    },
    get continueWatching() {
      return getContinueWatching();
    },
    get watchlist() {
      return getWatchlist();
    },
    get watchHistory() {
      return getWatchHistory();
    },
    get moviesLoading() {
      return false;
    },
    get seriesLoading() {
      return false;
    },

    async loadMovies() {
      try {
        const movies = await fetchMovies();
        stores.movies.set(movies);
      } catch (error) {
        console.error('Failed to load movies:', error);
      }
    },

    async loadSeries() {
      try {
        const series = await fetchSeries();
        stores.series.set(series);
      } catch (error) {
        console.error('Failed to load series:', error);
      }
    },

    async loadCategories() {
      try {
        const categories = await fetchCategories();
        stores.categories.set(categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    },

    loadUserData() {
      stores.continueWatching.set(getContinueWatching());
      stores.watchlist.set(getWatchlist());
    },

    async playContent(type: 'movie' | 'series', id: string) {
      await incrementViews(type === 'movie' ? 'movies' : 'series', id);
    },

    toggleWatchlist(item: WatchlistItem) {
      if (isInWatchlist(item.id, item.type)) {
        removeFromWatchlist(item.id, item.type);
      } else {
        addToWatchlist(item);
      }
      stores.watchlist.set(getWatchlist());
    },

    isWatchlisted(id: string, type: 'movie' | 'series') {
      return isInWatchlist(id, type);
    },

    async refreshData() {
      await Promise.all([
        this.loadMovies(),
        this.loadSeries(),
        this.loadCategories(),
      ]);
      this.loadUserData();
    },

    subscribeMovies(cb) {
      return stores.movies.subscribe(cb);
    },

    subscribeSeries(cb) {
      return stores.series.subscribe(cb);
    },
  };
}