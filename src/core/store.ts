// ============================================
// Simple Reactive Store
// ============================================

type Subscriber<T> = (value: T, oldValue: T) => void;

export class Store<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    const oldValue = this.value;
    if (Object.is(oldValue, newValue)) return;
    this.value = newValue;
    this.notify(newValue, oldValue);
  }

  update(updater: (current: T) => T): void {
    const oldValue = this.value;
    const newValue = updater(this.value);
    if (Object.is(oldValue, newValue)) return;
    this.value = newValue;
    this.notify(newValue, oldValue);
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(value: T, oldValue: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(value, oldValue);
    }
  }
}

// ---- Combined Store (multiple stores merged) ----

type StoresMap = Record<string, Store<unknown>>;

export function combineStores<T extends StoresMap>(
  stores: T
): Store<{ [K in keyof T]: T[K] extends Store<infer V> ? V : never }> {
  const getValue = () => {
    const result = {} as { [K in keyof T]: T[K] extends Store<infer V> ? V : never };
    for (const key in stores) {
      (result as Record<string, unknown>)[key] = stores[key].get();
    }
    return result;
  };

  const store = new Store(getValue());

  for (const key in stores) {
    stores[key].subscribe(() => {
      store.set(getValue());
    });
  }

  return store;
}

// ---- Derived Store (computed value) ----

export function derived<A, B>(
  store: Store<A>,
  fn: (value: A) => B
): Store<B> {
  const derivedStore = new Store<B>(fn(store.get()));

  store.subscribe((value) => {
    derivedStore.set(fn(value));
  });

  return derivedStore;
}

// ---- App-wide stores (initialized once) ----

import type { Movie, Series, Category, User, ContinueWatchingItem, WatchlistItem, AppSettings } from '@types';

export const stores = {
  // Auth
  user: new Store<User | null>(null),
  authLoading: new Store<boolean>(true),

  // Content
  movies: new Store<Movie[]>([]),
  series: new Store<Series[]>([]),
  categories: new Store<Category[]>([]),

  // User data
  continueWatching: new Store<ContinueWatchingItem[]>([]),
  watchlist: new Store<WatchlistItem[]>([]),

  // Settings
  settings: new Store<AppSettings | null>(null),

  // UI
  searchQuery: new Store<string>(''),
  activePage: new Store<string>('home'),
  sidebarOpen: new Store<boolean>(false),
  maintenanceMode: new Store<boolean>(false),
};