// ============================================
// Player Service — Player initialization and management
// ============================================

export interface StreamLink {
  name: string;
  url: string;
  quality: string;
  enabled: boolean;
}

export interface PlayerConfig {
  movieId: number;
  type: 'movie' | 'series';
  season?: number;
  episode?: number;
  server: string;
}

export interface Server {
  id: string;
  name: string;
  quality: string;
}

export const SERVERS: Server[] = [
  { id: 'server-1', name: 'Server 1', quality: 'HD' },
  { id: 'server-2', name: 'Server 2', quality: 'HD' },
  { id: 'server-3', name: 'Server 3', quality: 'SD' },
];

export function buildPlayerURL(config: PlayerConfig): string {
  const base = 'https://www.2embed.skin/embed';
  if (config.type === 'movie') {
    return `${base}/tmdb/movie?id=${config.movieId}`;
  }
  return `${base}/tmdb/tv?id=${config.movieId}&s=${config.season}&e=${config.episode}`;
}

export function buildExternalPlayerURL(
  config: PlayerConfig,
  player: 'vlc' | 'torrent' | 'webtorrent',
): string {
  const videoURL = buildPlayerURL(config);
  switch (player) {
    case 'vlc':
      return `vlc://${videoURL}`;
    case 'torrent':
      return `torrent://${videoURL}`;
    case 'webtorrent':
      return `https://webtorrent.io/torrents/${videoURL}`;
    default:
      return videoURL;
  }
}
