// ============================================
// Zustand Store — Central state management
// ============================================

import { create } from 'zustand';
import type { User, Movie, Series, Category } from '@/types';

// ---- State interface ----
interface AppState {
  // Auth
  user: User | null;
  authLoading: boolean;

  // Data
  movies: Movie[];
  series: Series[];
  categories: Category[];

  // UI
  activePage: string;
  searchQuery: string;
  theme: 'dark' | 'light';

  // Actions
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setMovies: (movies: Movie[]) => void;
  setSeries: (series: Series[]) => void;
  setCategories: (categories: Category[]) => void;
  setActivePage: (page: string) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

// ---- Load persisted theme ----
function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem('mvstream_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return 'dark';
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  authLoading: true,

  // Data
  movies: [],
  series: [],
  categories: [],

  // UI
  activePage: 'home',
  searchQuery: '',
  theme: getInitialTheme(),

  // Actions
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setMovies: (movies) => set({ movies }),
  setSeries: (series) => set({ series }),
  setCategories: (categories) => set({ categories }),
  setActivePage: (activePage) => set({ activePage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTheme: (theme) => {
    localStorage.setItem('mvstream_theme', theme);
    set({ theme });
  },
}));
