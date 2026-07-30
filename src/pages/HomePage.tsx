// ============================================
// Home Page — Hero, Sections, Continue Watching
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { useMovies } from '@/hooks/useMovies';
import { trendingAll } from '@/services/tmdb';
import { posterURL, backdropURL } from '@/services/tmdb';
import { getWatchHistory } from '@/services/storage';
import { formatRating } from '@/lib/utils';
import type { Movie, Series, TrendingItem } from '@/types';

export default function HomePage() {
  const { movies, series, loadMovies, loadSeries } = useMovies();
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const watchHistory = getWatchHistory();

  useEffect(() => {
    loadMovies(1);
    loadSeries(1);
    trendingAll('week').then((data) => setTrending(data.results.slice(0, 5)));
  }, [loadMovies, loadSeries]);

  // Auto-rotate hero
  useEffect(() => {
    if (trending.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % trending.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [trending.length]);

  const heroItem = trending[heroIndex];

  const handleHeroClick = useCallback(() => {
    setHeroIndex((i) => (i + 1) % trending.length);
  }, [trending.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroItem && (
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden cursor-pointer" onClick={handleHeroClick}>
          {/* Background */}
          {trending.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === heroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={backdropURL(item.backdrop_path, 'original')}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {'title' in heroItem ? heroItem.title : (heroItem as Series).name}
            </h1>
            <div className="flex items-center gap-3 mb-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                {formatRating(heroItem.vote_average)}
              </span>
              <span className="text-white/60">
                {('release_date' in heroItem ? heroItem.release_date?.slice(0, 4) : (heroItem as Series).first_air_date?.slice(0, 4)) || ''}
              </span>
              <span className="px-2 py-0.5 text-xs border border-white/20 rounded text-white/70">
                {heroItem.media_type === 'tv' ? 'Series' : 'Movie'}
              </span>
            </div>
            <p className="text-white/70 text-sm line-clamp-3 mb-6">
              {heroItem.overview}
            </p>
            <div className="flex gap-3">
              <Link
                to={`/details/${heroItem.media_type === 'tv' ? 'series' : 'movie'}/${heroItem.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
              >
                <Play size={18} fill="white" /> Play
              </Link>
              <Link
                to={`/details/${heroItem.media_type === 'tv' ? 'series' : 'movie'}/${heroItem.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium backdrop-blur-sm transition-colors"
              >
                <Info size={18} /> More Info
              </Link>
            </div>
          </div>

          {/* Indicators */}
          {trending.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {trending.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setHeroIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === heroIndex ? 'bg-brand-primary w-6' : 'bg-white/30'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Watching */}
      {watchHistory.length > 0 && (
        <Section title="Continue Watching" linkTo="/profile">
          {watchHistory.slice(0, 10).map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`/details/${item.type}/${item.id}`}
              className="shrink-0 w-36 group"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-2">
                {item.posterPath ? (
                  <img
                    src={posterURL(item.posterPath, 'w200')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <h4 className="text-sm text-white/80 truncate">{item.title}</h4>
            </Link>
          ))}
        </Section>
      )}

      {/* Trending Section */}
      {movies.length > 0 && (
        <Section title="Trending Now" linkTo="/movies">
          {movies.slice(0, 10).map((item) => (
            <MediaCard key={item.id} item={item} type="movie" />
          ))}
        </Section>
      )}

      {/* Top Rated Movies */}
      {movies.length > 0 && (
        <Section title="Top Rated Movies" linkTo="/movies">
          {[...movies].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10).map((item) => (
            <MediaCard key={item.id} item={item} type="movie" />
          ))}
        </Section>
      )}

      {/* New Series */}
      {series.length > 0 && (
        <Section title="New Web Series" linkTo="/series">
          {series.slice(0, 10).map((item) => (
            <MediaCard key={item.id} item={item} type="series" />
          ))}
        </Section>
      )}
    </div>
  );
}

// ---- Reusable Section ----
function Section({
  title,
  linkTo,
  children,
}: {
  title: string;
  linkTo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Link
          to={linkTo}
          className="text-sm text-brand-primary hover:text-brand-hover transition-colors"
        >
          See All &rarr;
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {children}
      </div>
    </section>
  );
}

// ---- Media Card ----
function MediaCard({ item, type }: { item: TrendingItem | Movie | Series; type: 'movie' | 'series' }) {
  const title = 'title' in item ? item.title : 'name' in item ? (item as Series).name : '';
  const rating = item.vote_average;
  const year = ('release_date' in item && item.release_date) ? item.release_date.slice(0, 4)
    : ('first_air_date' in item && (item as Series).first_air_date) ? (item as Series).first_air_date.slice(0, 4)
    : '';
  const poster = item.poster_path;

  return (
    <Link
      to={`/details/${type}/${item.id}`}
      className="shrink-0 w-36 group"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-2 relative">
        {poster ? (
          <img
            src={posterURL(poster, 'w200')}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-yellow-400">
          <Star size={10} fill="currentColor" />
          {formatRating(rating)}
        </div>
      </div>
      <h4 className="text-sm text-white/80 truncate">{title}</h4>
      <p className="text-xs text-white/40">{year}</p>
    </Link>
  );
}
