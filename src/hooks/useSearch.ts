// ============================================
// useSearch Hook — Search functionality
// ============================================

import { stores } from '@core/store';
import { debounce } from '@core/utils';
import { searchMulti } from '@services/tmdb';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@services/storage';
import type { TMDBMovie, TMDBSeries } from '@types';

export interface SearchFilters {
  type?: 'all' | 'movie' | 'series';
  year?: number;
  genre?: string;
}

export interface SearchResult {
  movies: TMDBMovie[];
  series: TMDBSeries[];
  totalResults: number;
  loading: boolean;
  error: string | null;
}

export interface UseSearchReturn {
  query: string;
  results: SearchResult;
  suggestions: (TMDBMovie | TMDBSeries)[];
  recentSearches: string[];
  trendingSearches: string[];

  // Actions
  search: (query: string) => Promise<void>;
  searchDebounced: (query: string) => void;
  setQuery: (query: string) => void;
  clearResults: () => void;
  clearRecentSearches: () => void;
  selectSuggestion: (item: TMDBMovie | TMDBSeries) => void;

  // Subscribe
  subscribe: (cb: (query: string) => void) => () => void;
}

let searchAbortController: AbortController | null = null;

export function useSearch(): UseSearchReturn {
  const doSearch = async (q: string) => {
    if (!q || q.length < 2) {
      stores.searchQuery.set(q);
      return;
    }

    searchAbortController?.abort();
    searchAbortController = new AbortController();

    stores.searchQuery.set(q);

    try {
      await searchMulti(q);

      if (!searchAbortController.signal.aborted) {
        stores.searchQuery.set(q);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Search failed:', error);
      }
    }
  };

  return {
    get query() {
      return stores.searchQuery.get();
    },
    get results() {
      return {
        movies: [],
        series: [],
        totalResults: 0,
        loading: false,
        error: null,
      };
    },
    get suggestions() {
      return [];
    },
    get recentSearches() {
      return getSearchHistory();
    },
    get trendingSearches() {
      return ['Action', 'Comedy', 'Drama', 'Horror', 'Marvel'];
    },

    async search(query: string) {
      await doSearch(query);
    },

    searchDebounced: debounce((query: string) => {
      doSearch(query);
    }, 400),

    setQuery(query: string) {
      stores.searchQuery.set(query);
    },

    clearResults() {
      stores.searchQuery.set('');
    },

    clearRecentSearches() {
      clearSearchHistory();
    },

    selectSuggestion(item: TMDBMovie | TMDBSeries) {
      const title = 'title' in item ? item.title : item.name;
      stores.searchQuery.set(title);
      addSearchHistory(title);
    },

    subscribe(cb: (query: string) => void) {
      return stores.searchQuery.subscribe(cb);
    },
  };
}
