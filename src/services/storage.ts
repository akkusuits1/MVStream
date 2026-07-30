// ============================================
// Storage Service — LocalStorage helpers
// ============================================

const PREFIX = 'mvstream_';

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(getKey(key));
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(getKey(key));
}

// ---- Watchlist ----
export function getWatchlist(): number[] {
  return getStorageItem<number[]>('watchlist', []);
}

export function addToWatchlist(id: number): void {
  const list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    setStorageItem('watchlist', list);
    notifyWatchlistListeners();
  }
}

export function removeFromWatchlist(id: number): void {
  const list = getWatchlist().filter((i) => i !== id);
  setStorageItem('watchlist', list);
  notifyWatchlistListeners();
}

export function isInWatchlist(id: number): boolean {
  return getWatchlist().includes(id);
}

// ---- Watchlist Listener ----
type WatchlistListener = () => void;
const watchlistListeners: Set<WatchlistListener> = new Set();

export function onWatchlistChange(callback: WatchlistListener): () => void {
  watchlistListeners.add(callback);
  return () => { watchlistListeners.delete(callback); };
}

function notifyWatchlistListeners() {
  watchlistListeners.forEach((cb) => cb());
}

// ---- Watch History ----
export interface WatchHistoryItem {
  id: number;
  type: 'movie' | 'series';
  title: string;
  posterPath: string | null;
  timestamp: number;
  season?: number;
  episode?: number;
}

export function getWatchHistory(): WatchHistoryItem[] {
  return getStorageItem<WatchHistoryItem[]>('history', []);
}

export function addToWatchHistory(item: WatchHistoryItem): void {
  const history = getWatchHistory().filter((h) => !(h.id === item.id && h.type === item.type));
  history.unshift(item);
  if (history.length > 50) history.pop();
  setStorageItem('history', history);
}

export function clearWatchHistory(): void {
  setStorageItem('history', []);
}

// ---- Player Settings ----
export interface PlayerSettings {
  defaultServer: string;
  autoPlay: boolean;
  autoplayNext: boolean;
  defaultQuality: string;
  externalPlayer: string;
}

export function getPlayerSettings(): PlayerSettings {
  return getStorageItem<PlayerSettings>('player_settings', {
    defaultServer: 'server-1',
    autoPlay: true,
    autoplayNext: true,
    defaultQuality: 'auto',
    externalPlayer: '',
  });
}

export function setPlayerSettings(settings: PlayerSettings): void {
  setStorageItem('player_settings', settings);
}

// ---- User Settings ----
export interface UserSettings {
  theme: 'dark' | 'light';
  language: string;
  notifications: boolean;
}

export function getUserSettings(): UserSettings {
  return getStorageItem<UserSettings>('user_settings', {
    theme: 'dark',
    language: 'en',
    notifications: true,
  });
}

export function setUserSettings(settings: UserSettings): void {
  setStorageItem('user_settings', settings);
}
