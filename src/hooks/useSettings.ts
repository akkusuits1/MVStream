// ============================================
// useSettings Hook — App settings management
// ============================================

import { stores } from '@core/store';
import { fetchSettings } from '@utils/helpers';
import type { AppSettings } from '@types';
import { DEFAULT_AD_CONFIG } from '@utils/constants';

export interface UseSettingsReturn {
  settings: AppSettings | null;
  maintenanceMode: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => void;
  subscribe: (cb: (settings: AppSettings | null) => void) => () => void;
}

export function useSettings(): UseSettingsReturn {
  return {
    get settings() {
      return stores.settings.get();
    },
    get maintenanceMode() {
      return stores.settings.get()?.maintenanceMode || false;
    },

    async loadSettings() {
      try {
        const raw = await fetchSettings();
        if (raw) {
          const settings: AppSettings = {
            maintenanceMode: (raw.maintenanceMode as boolean) || false,
            maintenanceMessage: (raw.maintenanceMessage as string) || 'Under maintenance',
            tmdbApiKey: (raw.tmdbApiKey as string) || '',
            ads: {
              ...DEFAULT_AD_CONFIG,
              ...((raw.ads as AppSettings['ads']) || {}),
            },
            appVersion: (raw.appVersion as string) || '2.0.0',
            updatedAt: (raw.updatedAt as number) || Date.now(),
          };
          stores.settings.set(settings);
          stores.maintenanceMode.set(settings.maintenanceMode);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },

    updateSettings(updates: Partial<AppSettings>) {
      stores.settings.update((current) => {
        if (!current) return current;
        return { ...current, ...updates };
      });
    },

    subscribe(cb: (settings: AppSettings | null) => void) {
      return stores.settings.subscribe(cb);
    },
  };
}
