// ============================================
// SearchModal — TMDB search for adding content
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Tv, Plus } from 'lucide-react';
import { searchMovies, searchSeries, posterURL } from '@/services/tmdb';
import type { Movie, Series } from '@/types';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'series';
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: SearchResult) => void;
  type: 'movie' | 'series';
}

export default function SearchModal({ open, onClose, onSelect, type }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (type === 'movie') {
          const data = await searchMovies(query, 1);
          setResults(data.results.map((m: Movie) => ({
            id: m.id,
            title: m.title,
            overview: m.overview,
            poster_path: m.poster_path,
            release_date: m.release_date,
            vote_average: m.vote_average,
            media_type: 'movie' as const,
          })));
        } else {
          const data = await searchSeries(query, 1);
          setResults(data.results.map((s: Series) => ({
            id: s.id,
            name: s.name,
            overview: s.overview,
            poster_path: s.poster_path,
            first_air_date: s.first_air_date,
            vote_average: s.vote_average,
            media_type: 'series' as const,
          })));
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${type === 'movie' ? 'movies' : 'series'} on TMDB...`}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              {query.trim() ? 'No results found' : 'Type to search...'}
            </div>
          ) : (
            <div className="py-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  {item.poster_path ? (
                    <img
                      src={posterURL(item.poster_path, 'w92')}
                      alt=""
                      className="w-10 h-[60px] rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-[60px] rounded bg-white/10 shrink-0 flex items-center justify-center">
                      {item.media_type === 'movie' ? (
                        <Film size={16} className="text-white/30" />
                      ) : (
                        <Tv size={16} className="text-white/30" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {item.release_date || item.first_air_date || 'Unknown'} &middot;{' '}
                      {item.vote_average.toFixed(1)} / 10
                    </p>
                  </div>
                  <Plus size={16} className="text-white/30 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
