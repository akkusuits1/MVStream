// ============================================
// Browse Page — Movies/Series Grid with Filters
// ============================================

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, Filter } from 'lucide-react';
import { useMovies } from '@/hooks/useMovies';
import { posterURL } from '@/services/tmdb';
import { formatRating } from '@/lib/utils';
import AdSlot from '@/components/ads/AdSlot';
import type { Movie, Series } from '@/types';

export default function BrowsePage() {
  const { type = 'movies' } = useParams<{ type: string }>();
  const { movies, series, categories, loadMovies, loadSeries, loadCategories } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const items: (Movie | Series)[] = type === 'movies' ? movies : series;
  const isMovies = type === 'movies';

  useEffect(() => {
    loadMovies(1);
    loadSeries(1);
    loadCategories();
  }, [loadMovies, loadSeries, loadCategories]);

  const getDate = (item: Movie | Series) =>
    'release_date' in item ? item.release_date : ('first_air_date' in item ? (item as Series).first_air_date : '');
  const getTitle = (item: Movie | Series) =>
    'title' in item ? item.title : (item as Series).name;

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'vote_average.desc':
        return b.vote_average - a.vote_average;
      case 'release_date.desc':
        return (getDate(b) || '').localeCompare(getDate(a) || '');
      case 'title.asc':
        return (getTitle(a) || '').localeCompare(getTitle(b) || '');
      default:
        return b.popularity - a.popularity;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isMovies ? 'Movies' : 'Web Series'}
        </h1>
        <p className="text-white/50">{items.length} {isMovies ? 'movies' : 'series'} available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Genre filter */}
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:border-brand-primary"
          >
            <option value="">All Genres</option>
            {categories.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:border-brand-primary"
        >
          <option value="popularity.desc">Popularity</option>
          <option value="vote_average.desc">Rating</option>
          <option value="release_date.desc">Release Date</option>
          <option value="title.asc">Title (A-Z)</option>
        </select>
      </div>

      <AdSlot position="in-content" className="mb-6" />

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedItems.map((item) => {
          const title = getTitle(item);
          const contentType = isMovies ? 'movie' : 'series';
          return (
            <Link
              key={item.id}
              to={`/details/${contentType}/${item.id}`}
              className="group"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-2 relative">
                {item.poster_path ? (
                  <img
                    src={posterURL(item.poster_path, 'w342')}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-yellow-400">
                  <Star size={10} fill="currentColor" />
                  {formatRating(item.vote_average)}
                </div>
              </div>
              <h3 className="text-sm text-white/80 truncate group-hover:text-white transition-colors">
                {title}
              </h3>
              <p className="text-xs text-white/40">
                {getDate(item)?.slice(0, 4) || 'TBA'}
              </p>
            </Link>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No content available</p>
        </div>
      )}
    </div>
  );
}
