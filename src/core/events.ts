// ============================================
// Event Bus — Global event system
// ============================================

type EventCallback<T = unknown> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const cb = callback as EventCallback;
    this.listeners.get(event)!.add(cb);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const wrapper: EventCallback<T> = (data) => {
      callback(data);
      this.off(event, wrapper as EventCallback);
    };
    return this.on<T>(event, wrapper);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit<T = unknown>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(data as T);
      }
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const events = new EventBus();

// ---- Named Events ----
export const EVENTS = {
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_REGISTER: 'auth:register',
  AUTH_ERROR: 'auth:error',

  // Content
  CONTENT_PLAY: 'content:play',
  CONTENT_ADD_WATCHLIST: 'content:add-watchlist',
  CONTENT_REMOVE_WATCHLIST: 'content:remove-watchlist',
  CONTENT_VIEW: 'content:view',

  // Player
  PLAYER_PLAY: 'player:play',
  PLAYER_PAUSE: 'player:pause',
  PLAYER_NEXT_EPISODE: 'player:next-episode',
  PLAYER_FULLSCREEN: 'player:fullscreen',

  // UI
  UI_TOAST: 'ui:toast',
  UI_MODAL_OPEN: 'ui:modal-open',
  UI_MODAL_CLOSE: 'ui:modal-close',
  UI_SIDEBAR_TOGGLE: 'ui:sidebar-toggle',
  UI_SEARCH: 'ui:search',

  // Notifications
  NOTIFICATION_PUSH: 'notification:push',
  NOTIFICATION_BROKEN_LINK: 'notification:broken-link',
  NOTIFICATION_CONTENT_REQUEST: 'notification:content-request',

  // Settings
  SETTINGS_MAINTENANCE: 'settings:maintenance',
  SETTINGS_UPDATE: 'settings:update',

  // Data
  DATA_MOVIES_LOADED: 'data:movies-loaded',
  DATA_SERIES_LOADED: 'data:series-loaded',
  DATA_CATEGORIES_LOADED: 'data:categories-loaded',
} as const;
