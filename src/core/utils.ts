// ============================================
// Core Utility Functions
// ============================================

/**
 * Create a DOM element with props and children
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Record<string, string | number | boolean | EventListenerOrEventListenerObject | null> & { class?: string; dataset?: Record<string, string> },
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'class') {
        el.className = value as string;
      } else if (key === 'dataset' && typeof value === 'object') {
        for (const [dKey, dVal] of Object.entries(value as Record<string, string>)) {
          el.dataset[dKey] = dVal;
        }
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value as EventListenerOrEventListenerObject);
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
        else el.removeAttribute(key);
      } else if (value != null) {
        el.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (child == null || child === false) continue;
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Shorthand for creating a div
 */
export const div = (props?: Parameters<typeof h<'div'>>[1], ...children: Parameters<typeof h<'div'>>[2]) =>
  h('div', props, ...children);

/**
 * Shorthand for creating an <img> element
 */
export function img(src: string, alt: string, className?: string): HTMLImageElement {
  const el = document.createElement('img');
  el.src = src;
  el.alt = alt;
  if (className) el.className = className;
  el.loading = 'lazy';
  el.decoding = 'async';
  return el;
}

/**
 * Clear an element's children
 */
export function clearChildren(el: Element): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format a date to a readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format duration (minutes) to "Xh Ym" or "Ym"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a unique ID
 */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * TMDB image URL helper
 */
export function tmdbImage(
  path: string | null | undefined,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  if (!path) return '/placeholder-poster.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Lazy-load an image with IntersectionObserver
 */
export function lazyImage(
  imgEl: HTMLImageElement,
  src: string,
  rootMargin = '200px'
): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgEl.src = src;
          observer.unobserve(imgEl);
        }
      });
    },
    { rootMargin }
  );
  observer.observe(imgEl);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simple CSS query selector
 */
export const $ = <T extends Element = Element>(selector: string, root: Element | Document = document): T | null =>
  root.querySelector<T>(selector);

/**
 * Query selector all
 */
export const $$ = <T extends Element = Element>(selector: string, root: Element | Document = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

/**
 * Sleep / delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}