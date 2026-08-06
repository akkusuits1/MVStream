// ============================================
// Details Page — Movie/Series detail view
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Users, ChevronDown, ChevronUp, BookmarkPlus, Send, Download } from 'lucide-react';
import { movieDetails, seriesDetails, seasonDetails, posterURL, backdropURL, profileURL } from '@/services/tmdb';
import { getGenreNames } from '@/lib/utils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { requestMovie } from '@/services/movieRequests';
import { getMovieByTmdbId, getSeriesByTmdbId } from '@/services/content';
import type { FirebaseMovie, FirebaseSeries } from '@/services/content';
import type { MovieDetails, SeriesDetails, Episode } from '@/types';
import type { StreamLink } from '@/services/player';
import AdSlot from '@/components/ads/AdSlot';
import { useSeoMeta } from '@/hooks/useSeoMeta';

export default function DetailsPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [details, setDetails] = useState<MovieDetails | SeriesDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);

  const { toggle: toggleWatchlist, isWatchlisted } = useWatchlist();
  const { isAuthenticated, user } = useAuth();
  const movieId = Number(id);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [firebaseMovie, setFirebaseMovie] = useState<FirebaseMovie | null>(null);
  const [firebaseSeries, setFirebaseSeries] = useState<FirebaseSeries | null>(null);
  const [selectedLink, setSelectedLink] = useState<StreamLink | null>(null);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError('');

    const fetchDetails = type === 'movie' ? movieDetails(movieId) : seriesDetails(movieId);
    fetchDetails
      .then((data) => setDetails(data))
      .catch(() => setError('Failed to load details'))
      .finally(() => setLoading(false));
  }, [movieId, type]);

  // Load Firebase content for stream links
  useEffect(() => {
    if (!movieId) return;
    if (type === 'movie') {
      getMovieByTmdbId(movieId).then((m) => {
        if (m) {
          setFirebaseMovie(m);
          const enabled = (m.streamLinks ?? []).filter((l) => l.enabled);
          if (enabled.length > 0) setSelectedLink(enabled[0]);
        }
      });
    } else {
      getSeriesByTmdbId(movieId).then((s) => {
        if (s) setFirebaseSeries(s);
      });
    }
  }, [movieId, type]);

  // Load season episodes
  useEffect(() => {
    if (type !== 'series' || !details || !('seasons' in details)) return;
    seasonDetails(movieId, selectedSeason)
      .then((data) => setEpisodes(data.episodes || []))
      .catch(() => setEpisodes([]));
  }, [movieId, type, selectedSeason, details]);

  const isMovie = type === 'movie';
  const title = isMovie ? (details as MovieDetails)?.title || '' : (details as SeriesDetails)?.name || '';

  useSeoMeta({
    title: title || 'Loading...',
    description: details?.overview?.slice(0, 160) || `Watch ${title || type} on MVStream`,
    image: details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : undefined,
    url: `/details/${type}/${id}`,
    type: isMovie ? 'video.movie' : 'video.tv',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">{error || 'Not found'}</p>
          <Link to="/" className="text-brand-primary hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const movieDetails_ = isMovie ? details as MovieDetails : null;
  const seriesDetails_ = !isMovie ? details as SeriesDetails : null;
  const releaseDate = movieDetails_?.release_date || seriesDetails_?.first_air_date || '';
  const runtime = movieDetails_?.runtime;
  const seasons = seriesDetails_?.seasons;
  const genres = getGenreNames(details.genres.map((g) => g.id));
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const trailer = details.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube',
  );

  const handleRequestMovie = async () => {
    if (!user || !movieId) return;
    setRequestLoading(true);
    try {
      await requestMovie({
        tmdbId: movieId,
        type: type === 'series' ? 'series' : 'movie',
        title,
        posterPath: details.poster_path || '',
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
      });
      setRequestSent(true);
    } catch (e) {
      console.error('Failed to request movie:', e);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        {details.backdrop_path ? (
          <img
            src={backdropURL(details.backdrop_path, 'original')}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-48 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 flex flex-col md:flex-row gap-8 min-w-0">
          {/* Poster */}
          <div className="shrink-0 w-48 md:w-64">
            {details.poster_path ? (
              <img
                src={posterURL(details.poster_path, 'w342')}
                alt={title}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-xl bg-white/10 flex items-center justify-center text-white/30">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                {details.vote_average?.toFixed(1) ?? 'N/A'}
              </span>
              {releaseDate && (
                <span className="flex items-center gap-1 text-white/60">
                  <Calendar size={14} />
                  {releaseDate.slice(0, 4)}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1 text-white/60">
                  <Clock size={14} />
                  {runtime}m
                </span>
              )}
              {!isMovie && seasons && (
                <span className="flex items-center gap-1 text-white/60">
                  <Clock size={14} />
                  {seasons.length} Season{seasons.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-white/70 leading-relaxed mb-6">{details.overview}</p>

            <AdSlot position="in-content" className="mb-6" />

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {trailer ? (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
                >
                  <Play size={18} fill="white" /> Trailer
                </a>
              ) : null}

              {/* Stream link dropdown + Play + Download */}
              {(() => {
                const links = isMovie
                  ? (firebaseMovie?.streamLinks ?? []).filter((l) => l.enabled)
                  : (firebaseSeries?.seasons ?? [])
                      .find((s) => s.number === selectedSeason)
                      ?.episodes?.find((e) => e.number === expandedEpisode)
                      ?.streamLinks?.filter((l) => l.enabled) ?? [];

                if (links.length === 0) {
                  return (
                    <Link
                      to={`/player/${type}/${movieId}`}
                      className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
                    >
                      <Play size={18} fill="white" /> Watch Now
                    </Link>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLink?.url ?? ''}
                      onChange={(e) => {
                        const link = links.find((l) => l.url === e.target.value);
                        setSelectedLink(link ?? null);
                      }}
                      className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-brand-primary appearance-none cursor-pointer min-w-[180px]"
                    >
                      {links.map((l) => (
                        <option key={l.url} value={l.url} className="bg-neutral-900 text-white">
                          {l.name || l.quality}
                        </option>
                      ))}
                    </select>
                    <a
                      href={selectedLink?.url ?? links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
                    >
                      <Play size={18} fill="white" /> Play
                    </a>
                    <a
                      href={selectedLink?.url ?? links[0].url}
                      download
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                    >
                      <Download size={18} /> Download
                    </a>
                  </div>
                );
              })()}

              {isAuthenticated && (
                <button
                  onClick={() => toggleWatchlist(movieId)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isWatchlisted(movieId)
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <BookmarkPlus size={18} />
                  {isWatchlisted(movieId) ? 'In Watchlist' : 'Watchlist'}
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleRequestMovie}
                  disabled={requestSent || requestLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    requestSent
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Send size={18} />
                  {requestSent ? 'Requested' : requestLoading ? 'Sending...' : 'Request'}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Ad */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-20">
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {cast.map((member) => (
                <div key={member.id} className="shrink-0 w-24 text-center">
                  {member.profile_path ? (
                    <img
                      src={profileURL(member.profile_path, 'w185')}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                      <Users size={20} className="text-white/30" />
                    </div>
                  )}
                  <p className="text-xs text-white/80 truncate">{member.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seasons & Episodes (Series only) */}
        {!isMovie && seasons && seasons.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>

            {/* Season selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {seasons.filter((s) => s.season_number > 0).map((season) => (
                <button
                  key={season.season_number}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSeason === season.season_number
                      ? 'bg-brand-primary text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Season {season.season_number}
                </button>
              ))}
            </div>

            {/* Episodes */}
            <div className="space-y-3">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-white/5 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEpisode(expandedEpisode === ep.episode_number ? null : ep.episode_number)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/40 text-sm font-mono w-8">{ep.episode_number}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{ep.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                        {ep.runtime && <span>{ep.runtime}m</span>}
                        {ep.vote_average > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star size={10} fill="currentColor" /> {ep.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedEpisode === ep.episode_number ? (
                      <ChevronUp size={16} className="text-white/40" />
                    ) : (
                      <ChevronDown size={16} className="text-white/40" />
                    )}
                  </button>
                  {expandedEpisode === ep.episode_number && (
                    <div className="px-4 pb-4">
                      {ep.overview && (
                        <p className="text-sm text-white/50 mb-3">{ep.overview}</p>
                      )}
                      {(() => {
                        const epLinks = (firebaseSeries?.seasons ?? [])
                          .find((s) => s.number === selectedSeason)
                          ?.episodes?.find((e) => e.number === ep.episode_number)
                          ?.streamLinks?.filter((l) => l.enabled) ?? [];

                        if (epLinks.length === 0) {
                          return (
                            <Link
                              to={`/player/series/${movieId}?season=${selectedSeason}&episode=${ep.episode_number}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Play size={14} fill="white" /> Play Episode
                            </Link>
                          );
                        }

                        const isActive = expandedEpisode === ep.episode_number;
                        const currentLink = isActive ? selectedLink : epLinks[0];

                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={currentLink?.url ?? ''}
                              onChange={(e) => {
                                const link = epLinks.find((l) => l.url === e.target.value);
                                setSelectedLink(link ?? null);
                              }}
                              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary appearance-none cursor-pointer min-w-[140px]"
                            >
                              {epLinks.map((l) => (
                                <option key={l.url} value={l.url} className="bg-neutral-900 text-white">
                                  {l.name || l.quality}
                                </option>
                              ))}
                            </select>
                            <a
                              href={currentLink?.url ?? epLinks[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Play size={14} fill="white" /> Play
                            </a>
                            <a
                              href={currentLink?.url ?? epLinks[0].url}
                              download
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Download size={14} /> Download
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
