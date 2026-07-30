import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { discoverMovies, discoverSeries, searchMovies, searchSeries } from '@/services/tmdb';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from '@/services/storage';
import type { Movie, Series } from '@/types';

export function useMovies() {
  const movies = useStore((s) => s.movies);
  const series = useStore((s) => s.series);
  const categories = useStore((s) => s.categories);
  const setMovies = useStore((s) => s.setMovies);
  const setSeries = useStore((s) => s.setSeries);
  const setCategories = useStore((s) => s.setCategories);

  const loadMovies = useCallback(async (page = 1) => {
    const data = await discoverMovies(page);
    setMovies(data.results as Movie[]);
    return data;
  }, [setMovies]);

  const loadSeries = useCallback(async (page = 1) => {
    const data = await discoverSeries(page);
    setSeries(data.results as Series[]);
    return data;
  }, [setSeries]);

  const loadCategories = useCallback(async () => {
    setCategories([]);
  }, [setCategories]);

  const loadSearch = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    const [moviesData, seriesData] = await Promise.all([
      searchMovies(query),
      searchSeries(query),
    ]);
    return [...moviesData.results, ...seriesData.results];
  }, []);

  const toggleWatchlist = useCallback((itemOrId: Movie | Series | number) => {
    const id = typeof itemOrId === 'number' ? itemOrId : itemOrId.id;
    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  }, []);

  const checkWatchlisted = useCallback((id: number) => {
    return isInWatchlist(id);
  }, []);

  return {
    movies,
    series,
    categories,
    loadMovies,
    loadSeries,
    loadCategories,
    loadSearch,
    toggleWatchlist,
    isWatchlisted: checkWatchlisted,
    watchlist: getWatchlist(),
  };
}
