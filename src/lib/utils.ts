// ============================================
// Utility Functions
// ============================================

import { type ClassValue, clsx } from 'clsx';

// Simple cn() helper without tailwind-merge (we'll add it if needed)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ---- Date formatting ----
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatYear(dateStr: string): string {
  if (!dateStr) return 'TBA';
  return new Date(dateStr).getFullYear().toString();
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ---- Rating ----
export function getRatingColor(rating: number): string {
  if (rating >= 7) return '#00D4AA';
  if (rating >= 5) return '#FFB800';
  return '#FF4757';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// ---- Genre mapping ----
const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
  10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics',
};

export function getGenreName(id: number): string {
  return GENRE_MAP[id] || 'Unknown';
}

export function getGenreNames(ids: number[]): string[] {
  return ids.map(getGenreName);
}

// ---- Debounce ----
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
