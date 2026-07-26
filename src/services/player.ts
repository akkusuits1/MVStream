// ============================================
// Player Service — Plyr integration
// ============================================

import Plyr from 'plyr';
import type { ContinueWatchingItem, ServerLink } from '@types';
import { addToContinueWatching } from './storage';

let currentPlayer: Plyr | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

// ---- Initialize Plyr ----
export function initPlayer(
  container: string | HTMLDivElement,
  options?: Partial<Plyr.Options>,
): Plyr {
  destroyPlayer();

  const defaults: Plyr.Options = {
    controls: [
      'play-large',
      'rewind',
      'play',
      'fast-forward',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen',
    ],
    settings: ['captions', 'quality', 'speed'],
    tooltips: { controls: true, seek: true },
    keyboard: { focused: true, global: true },
    fullscreen: { enabled: true, fallback: true, iosNative: true },
    storage: { enabled: true, key: 'mvstream-player' },
    ...options,
  };

  currentPlayer = new Plyr(container, defaults);
  return currentPlayer;
}

// ---- Load video source ----
export function loadVideo(player: Plyr, url: string, type: 'video' | 'hls' = 'video'): void {
  if (type === 'hls') {
    // For HLS streams, we use the native HLS support or a library
    player.source = {
      type: 'video',
      sources: [{ src: url, type: 'application/x-mpegURL' }],
    };
  } else {
    player.source = {
      type: 'video',
      sources: [{ src: url }],
    };
  }
}

// ---- Start tracking progress ----
export function startProgressTracking(
  player: Plyr,
  contentId: string,
  contentType: 'movie' | 'series',
  contentTitle: string,
  contentPoster: string,
  contentBackdrop?: string,
  seasonId?: string,
  episodeId?: string,
  episodeNumber?: number,
  seasonNumber?: number,
): void {
  stopProgressTracking();

  progressInterval = setInterval(() => {
    if (player.paused || player.ended) return;

    const currentTime = player.currentTime;
    const duration = player.duration;

    if (!duration || duration === 0) return;

    const progress = Math.round((currentTime / duration) * 100);

    const item: ContinueWatchingItem = {
      id: contentId,
      type: contentType,
      title: contentTitle,
      poster: contentPoster,
      backdrop: contentBackdrop,
      serverId: undefined,
      serverName: undefined,
      seasonId,
      episodeId,
      episodeNumber,
      seasonNumber,
      progress,
      duration: Math.round(duration),
      timestamp: Date.now(),
    };

    addToContinueWatching(item);
  }, 10000); // Track every 10 seconds
}

// ---- Stop tracking progress ----
export function stopProgressTracking(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// ---- Seek to time (for continue watching) ----
export function seekTo(player: Plyr, seconds: number): void {
  if (player.duration && seconds > 0) {
    player.currentTime = seconds;
  }
}

// ---- Destroy player ----
export function destroyPlayer(): void {
  stopProgressTracking();
  if (currentPlayer) {
    currentPlayer.destroy();
    currentPlayer = null;
  }
}

// ---- Get current player ----
export function getPlayer(): Plyr | null {
  return currentPlayer;
}

// ---- External player launch ----
export function launchExternalPlayer(
  url: string,
  player: 'vlc' | 'mx-player' | 'system' = 'system',
): void {
  switch (player) {
    case 'vlc':
      // VLC protocol
      window.open(`vlc://${encodeURIComponent(url)}`, '_blank');
      break;
    case 'mx-player':
      // MX Player intent
      window.open(
        `intent:${url}#Intent;package=com.mxtech.videoplayer.ad;type=video/*;end`,
        '_blank',
      );
      break;
    default:
      // System default
      window.open(url, '_blank');
  }
}

// ---- Get best quality from servers ----
export function getBestServer(servers: ServerLink[]): ServerLink | null {
  if (servers.length === 0) return null;

  const qualityOrder = { '4K': 4, FHD: 3, HD: 2, SD: 1 };
  return [...servers].sort((a, b) => {
    const aQ = qualityOrder[a.quality || 'SD'] || 0;
    const bQ = qualityOrder[b.quality || 'SD'] || 0;
    return bQ - aQ;
  })[0];
}

// ---- Keyboard shortcuts overlay ----
export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause' },
  { key: '→', description: 'Seek forward 10s' },
  { key: '←', description: 'Seek backward 10s' },
  { key: '↑', description: 'Volume up' },
  { key: '↓', description: 'Volume down' },
  { key: 'f', description: 'Toggle fullscreen' },
  { key: 'm', description: 'Mute / Unmute' },
  { key: 'Esc', description: 'Exit fullscreen' },
  { key: '0-9', description: 'Seek to 0%-90%' },
];
