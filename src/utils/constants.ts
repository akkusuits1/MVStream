// ============================================
// App Constants
// ============================================

export const APP_NAME = 'MVStream';
export const APP_VERSION = '2.0.0';

// ---- Routes ----
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  SERIES: '/series',
  SEARCH: '/search',
  DETAILS: '/details/:type/:id',
  PLAYER: '/player/:type/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ABOUT: '/about',
  HELP: '/help',
  PRIVACY: '/privacy',
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '/404',
} as const;

// ---- TMDB Genres ----
export const MOVIE_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

// ---- Ad Defaults ----
export const DEFAULT_AD_CONFIG = {
  enabled: false,
  bannerZoneId: '',
  interstitialZoneId: '',
  pushZoneId: '',
  interstitialInterval: 120, // 2 minutes
};

// ---- Pagination ----
export const ITEMS_PER_PAGE = 20;

// ---- Image Sizes ----
export const IMAGE_SIZES = {
  POSTER_SM: 'w154',
  POSTER_MD: 'w342',
  POSTER_LG: 'w500',
  POSTER_XL: 'w780',
  BACKDROP_SM: 'w300',
  BACKDROP_MD: 'w780',
  BACKDROP_LG: 'w1280',
  BACKDROP_ORIG: 'original',
} as const;

// ---- Player ----
export const PLAYER_QUALITIES = ['auto', '1080', '720', '480'] as const;

export const EXTERNAL_PLAYERS = {
  vlc: { name: 'VLC Player', icon: 'play-circle' },
  mxPlayer: { name: 'MX Player', icon: 'play-circle' },
  system: { name: 'System Player', icon: 'play-circle' },
} as const;

// ---- Social / Contact ----
export const CONTACT = {
  email: 'support@mvstream.com',
  telegram: 'https://t.me/mvstream',
  github: 'https://github.com/mvstream',
} as const;
