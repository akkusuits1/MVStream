// ============================================
// Search Page — Search with results
// ============================================

import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Star } from 'lucide-react';
import { searchMovies, searchSeries, posterURL } from '@/services/tmdb';
import { debounce, formatRating } from '@/lib/utils';
import type { Movie, Series } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [seriesResults, setSeriesResults] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 2) {
        setMovieResults([]);
        setSeriesResults([]);
        return;
      }
      setLoading(true);
      try {
        const [movies, series] = await Promise.all([searchMovies(q), searchSeries(q)]);
        setMovieResults(movies.results);
        setSeriesResults(series.results);
      } catch {
        console.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 400),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    doSearch(val);
  };

  const clearSearch = () => {
    setQuery('');
    setMovieResults([]);
    setSeriesResults([]);
    inputRef.current?.focus();
  };

  const hasResults = movieResults.length > 0 || seriesResults.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder="Search movies, series..."
          className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-primary text-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-8">
          {/* Movie Results */}
          {movieResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Movies</h2>
              <div className="space-y-3">
                {movieResults.slice(0, 10).map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/details/movie/${movie.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    {movie.poster_path ? (
                      <img
                        src={posterURL(movie.poster_path, 'w92')}
                        alt={movie.title}
                        className="w-12 h-18 rounded object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-18 rounded bg-white/10 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-brand-primary transition-colors truncate">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          {formatRating(movie.vote_average)}
                        </span>
                        <span>{movie.release_date?.slice(0, 4)}</span>
                      </div>
                      {movie.overview && (
                        <p className="text-sm text-white/40 mt-1 line-clamp-1">{movie.overview}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Series Results */}
          {seriesResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Series</h2>
              <div className="space-y-3">
                {seriesResults.slice(0, 10).map((series) => (
                  <Link
                    key={series.id}
                    to={`/details/series/${series.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    {series.poster_path ? (
                      <img
                        src={posterURL(series.poster_path, 'w92')}
                        alt={series.name}
                        className="w-12 h-18 rounded object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-18 rounded bg-white/10 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-brand-primary transition-colors truncate">
                        {series.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          {formatRating(series.vote_average)}
                        </span>
                        <span>{series.first_air_date?.slice(0, 4)}</span>
                      </div>
                      {series.overview && (
                        <p className="text-sm text-white/40 mt-1 line-clamp-1">{series.overview}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && query.length >= 2 && !hasResults && (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg mb-2">No results found</p>
          <p className="text-white/30 text-sm">Try different keywords</p>
        </div>
      )}

      {/* Initial state */}
      {!loading && query.length < 2 && (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 text-lg">Search for movies and series</p>
        </div>
      )}
    </div>
  );
}
