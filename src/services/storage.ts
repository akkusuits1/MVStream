// ============================================
// Local Storage Service — User data persistence
// ============================================

import type { ContinueWatchingItem, WatchlistItem } from '@types';

const PREFIX = 'mvstream_';

function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage: ${key}`, e);
  }
}

function removeStorageItem(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

// ---- Continue Watching ----

export function getContinueWatching(): ContinueWatchingItem[] {
  return getStorageItem('continue_watching', []);
}

export function addToContinueWatching(item: ContinueWatchingItem): void {
  const items = getContinueWatching();
  const existing = items.findIndex(
    (i) =>
      i.id === item.id &&
      i.type === item.type &&
      i.seasonId === item.seasonId &&
      i.episodeId === item.episodeId
  );

  if (existing >= 0) {
    items[existing] = { ...items[existing], ...item, timestamp: Date.now() };
  } else {
    items.unshift(item);
  }

  // Keep max 50 items
  setStorageItem('continue_watching', items.slice(0, 50));
}

export function removeFromContinueWatching(id: string, type: string): void {
  const items = getContinueWatching().filter(
    (i) => !(i.id === id && i.type === type)
  );
  setStorageItem('continue_watching', items);
}

export function clearContinueWatching(): void {
  setStorageItem('continue_watching', []);
}

// ---- Watch History ----

export interface HistoryItem {
  id: string;
  type: 'movie' | 'series';
  title: string;
  poster: string;
  timestamp: number;
}

export function getWatchHistory(): HistoryItem[] {
  return getStorageItem('watch_history', []);
}

export function addToWatchHistory(item: HistoryItem): void {
  const items = getWatchHistory();
  const existing = items.findIndex((i) => i.id === item.id && i.type === item.type);

  if (existing >= 0) {
    items[existing] = { ...items[existing], timestamp: Date.now() };
  } else {
    items.unshift(item);
  }

  setStorageItem('watch_history', items.slice(0, 200));
}

export function clearWatchHistory(): void {
  setStorageItem('watch_history', []);
}

// ---- Watchlist ----

export function getWatchlist(): WatchlistItem[] {
  return getStorageItem('watchlist', []);
}

export function addToWatchlist(item: WatchlistItem): void {
  const items = getWatchlist();
  if (!items.find((i) => i.id === item.id && i.type === item.type)) {
    items.unshift(item);
    setStorageItem('watchlist', items);
  }
}

export function removeFromWatchlist(id: string, type: string): boolean {
  const items = getWatchHistory().filter(
    (i) => !(i.id === id && i.type === type)
  );
  setStorageItem('watch_history', items);

  const watchlist = getWatchlist().filter(
    (i) => !(i.id === id && i.type === type)
  );
  setStorageItem('watchlist', watchlist);

  return true;
}

export function isInWatchlist(id: string, type: string): boolean {
  return getWatchlist().some((i) => i.id === id && i.type === type);
}

// ---- Settings ----

export interface PlayerSettings {
  defaultQuality: 'auto' | '1080' | '720' | '480';
  autoPlay: boolean;
  defaultServer: string;
  externalPlayer: boolean;
}

export function getPlayerSettings(): PlayerSettings {
  return getStorageItem('player_settings', {
    defaultQuality: 'auto',
    autoPlay: true,
    defaultServer: '',
    externalPlayer: false,
  });
}

export function setPlayerSettings(settings: Partial<PlayerSettings>): void {
  const current = getPlayerSettings();
  setStorageItem('player_settings', { ...current, ...settings });
}

// ---- Search History ----

export function getSearchHistory(): string[] {
  return getStorageItem('search_history', []);
}

export function addSearchHistory(query: string): void {
  const history = getSearchHistory().filter((q) => q !== query);
  history.unshift(query);
  setStorageItem('search_history', history.slice(0, 20));
}

export function clearSearchHistory(): void {
  setStorageItem('search_history', []);
}

// ---- View Preferences ----

export type ViewMode = 'grid' | 'list';

export function getViewMode(): ViewMode {
  return getStorageItem('view_mode', 'grid');
}

export function setViewMode(mode: ViewMode): void {
  setStorageItem('view_mode', mode);
}

// ---- Clear all user data ----

export function clearAllUserData(): void {
  removeStorageItem('continue_watching');
  removeStorageItem('watch_history');
  removeStorageItem('watchlist');
  removeStorageItem('player_settings');
  removeStorageItem('search_history');
  removeStorageItem('view_mode');
}