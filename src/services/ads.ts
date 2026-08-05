// ============================================
// Ads Service — Firebase CRUD for ad placements & config
// ============================================

import { ref, push, get, remove, update } from 'firebase/database';
import { db } from './firebase';

// ---- Types ----
export type AdProvider = 'adsense' | 'adsterra' | 'monatag';
export type AdType = 'banner' | 'native' | 'popunder' | 'socialbar' | 'smartlink' | 'push' | 'in-page-push';
export type PlacementPosition = 'header' | 'sidebar' | 'in-content' | 'footer' | 'popup' | 'interstitial';

export interface AdConfig {
  adBlockerEnabled: boolean;
  adBlockerMessage: string;
}

export interface AdPlacement {
  id?: string;
  name: string;
  position: PlacementPosition;
  enabled: boolean;
  ads: AdUnit[];
  createdAt: number;
  updatedAt: number;
}

export interface AdUnit {
  id?: string;
  name: string;
  provider: AdProvider;
  type: AdType;
  code: string;
  enabled: boolean;
  size: string;
  mobileCode: string;
  createdAt: number;
  updatedAt: number;
}

// ---- Constants ----
const CONFIG_PATH = 'ads/config';
const PLACEMENTS_PATH = 'ads/placements';

const DEFAULT_CONFIG: AdConfig = {
  adBlockerEnabled: true,
  adBlockerMessage: 'Ad Blocker Detected! Please disable your ad blocker to support us and continue enjoying content.',
};

// ---- Config CRUD ----
export async function getAdConfig(): Promise<AdConfig> {
  if (!db) return DEFAULT_CONFIG;
  try {
    const configRef = ref(db, CONFIG_PATH);
    const snapshot = await Promise.race([
      get(configRef),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
    ]);
    if (!snapshot || !snapshot.exists()) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...(snapshot.val() as Partial<AdConfig>) };
  } catch (e) {
    console.warn('Failed to load ad config:', e);
    return DEFAULT_CONFIG;
  }
}

export async function updateAdConfig(data: Partial<AdConfig>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const configRef = ref(db, CONFIG_PATH);
  await update(configRef, data);
}

// ---- Placements CRUD ----
export async function getPlacements(): Promise<AdPlacement[]> {
  if (!db) return [];
  try {
    const placementsRef = ref(db, PLACEMENTS_PATH);
    const snapshot = await Promise.race([
      get(placementsRef),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
    ]);
    if (!snapshot || !snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, val]) => {
      const placement = val as Omit<AdPlacement, 'id'>;
      const ads = placement.ads
        ? Object.entries(placement.ads).map(([adId, adVal]) => ({
            id: adId,
            ...(adVal as Omit<AdUnit, 'id'>),
          }))
        : [];
      return { id, ...placement, ads };
    }).sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.warn('Failed to load ad placements:', e);
    return [];
  }
}

export async function addPlacement(data: Omit<AdPlacement, 'id' | 'createdAt' | 'updatedAt' | 'ads'>): Promise<string> {
  console.log('[Ads] addPlacement called, db:', !!db);
  if (!db) throw new Error('Firebase Realtime Database not initialized — check VITE_FIREBASE_DATABASE_URL env var');
  console.log('[Ads] Adding placement:', data);
  const placementsRef = ref(db, PLACEMENTS_PATH);
  const newRef = await Promise.race([
    push(placementsRef, {
      ...data,
      ads: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Write timed out — check Firebase security rules for ads/placements')), 15000)),
  ]);
  console.log('[Ads] Placement created:', newRef.key);
  return newRef.key!;
}

export async function updatePlacement(id: string, data: Partial<AdPlacement>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const placementRef = ref(db, `${PLACEMENTS_PATH}/${id}`);
  const { ads: _ads, ...rest } = data;
  await Promise.race([
    update(placementRef, { ...rest, updatedAt: Date.now() }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Write timed out')), 15000)),
  ]);
}

export async function deletePlacement(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const placementRef = ref(db, `${PLACEMENTS_PATH}/${id}`);
  await Promise.race([
    remove(placementRef),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Delete timed out')), 15000)),
  ]);
}

// ---- Ad Units CRUD (nested under placements) ----
export async function addAdUnit(placementId: string, data: Omit<AdUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const adsRef = ref(db, `${PLACEMENTS_PATH}/${placementId}/ads`);
  const newRef = await Promise.race([
    push(adsRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Write timed out')), 15000)),
  ]);
  return newRef.key!;
}

export async function updateAdUnit(placementId: string, adId: string, data: Partial<AdUnit>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const adRef = ref(db, `${PLACEMENTS_PATH}/${placementId}/ads/${adId}`);
  await Promise.race([
    update(adRef, { ...data, updatedAt: Date.now() }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Write timed out')), 15000)),
  ]);
}

export async function deleteAdUnit(placementId: string, adId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const adRef = ref(db, `${PLACEMENTS_PATH}/${placementId}/ads/${adId}`);
  await Promise.race([
    remove(adRef),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Delete timed out')), 15000)),
  ]);
}

// ---- Helper: Get enabled ads for a position ----
export async function getEnabledAdsForPosition(position: PlacementPosition): Promise<{ placement: AdPlacement; ads: AdUnit[] }[]> {
  const placements = await getPlacements();
  return placements
    .filter((p) => p.position === position && p.enabled)
    .map((p) => ({
      placement: p,
      ads: p.ads.filter((a) => a.enabled),
    }))
    .filter((p) => p.ads.length > 0);
}
