// ============================================
// Services Barrel Export
// ============================================

export { auth, db, getAnalyticsInstance } from './firebase';

export {
  initAuth,
  signInWithGoogle,
  logout,
  updateUserProfile,
  isAdmin,
  fetchAllUsers,
  updateUserRole,
  updateUserStatus,
  cleanupAuth,
} from './auth';

export {
  posterURL,
  backdropURL,
  profileURL,
  searchMulti,
  searchMovies,
  searchSeries,
  trendingAll,
  trendingMovies,
  trendingSeries,
  discoverMovies,
  discoverSeries,
  getMovieDetails,
  getSeriesDetails,
  getSeasonDetails,
  tmdbToMovie,
  tmdbToSeries,
  youtubeTrailerURL,
  youtubeThumbnail,
} from './tmdb';

export {
  getContinueWatching,
  addToContinueWatching,
  removeFromContinueWatching,
  clearContinueWatching,
  getWatchHistory,
  addToWatchHistory,
  clearWatchHistory,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getPlayerSettings,
  setPlayerSettings,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  clearAllUserData,
} from './storage';

export {
  initPlayer,
  loadVideo,
  startProgressTracking,
  stopProgressTracking,
  seekTo,
  destroyPlayer,
  getPlayer,
  launchExternalPlayer,
  getBestServer,
} from './player';
