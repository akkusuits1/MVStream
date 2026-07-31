// ============================================
// BulkAddModal — Add multiple movies/series at once from TMDB
// ============================================

import { useState } from 'react';
import { X, Search, Plus, Check, Loader2, Film, Tv } from 'lucide-react';
import { searchMovies, searchSeries, movieDetails, seriesDetails, posterURL } from '@/services/tmdb';
import { addMovie, addSeries, getMovieByTmdbId, getSeriesByTmdbId } from '@/services/content';
import type { Movie, Series } from '@/types';
import { logActivity } from '@/services/activityLog';
import { useStore } from '@/store/useStore';

interface BulkAddModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  type: 'movie' | 'series';
}

interface SearchItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  selected: boolean;
  status: 'idle' | 'adding' | 'added' | 'exists' | 'error';
}

export default function BulkAddModal({ open, onClose, onComplete, type }: BulkAddModalProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const user = useStore((s) => s.user);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setItems([]);
    try {
      let results: Movie[] | Series[];
      if (type === 'movie') {
        const data = await searchMovies(query, 1);
        results = data.results;
      } else {
        const data = await searchSeries(query, 1);
        results = data.results;
      }
      setItems(
        results.map((item) => ({
          id: item.id,
          title: 'title' in item ? item.title : undefined,
          name: 'name' in item ? item.name : undefined,
          overview: item.overview,
          poster_path: item.poster_path,
          release_date: 'release_date' in item ? item.release_date : undefined,
          first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
          vote_average: item.vote_average,
          selected: true,
          status: 'idle' as const,
        })),
      );
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const selectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const addSingle = async (item: SearchItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'adding' as const } : i)),
    );
    try {
      if (type === 'movie') {
        const existing = await getMovieByTmdbId(item.id);
        if (existing) {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'exists' as const } : i)),
          );
          return;
        }
        const details = await movieDetails(item.id);
        await addMovie({
          tmdbId: details.id,
          title: details.title,
          overview: details.overview,
          posterPath: details.poster_path,
          backdropPath: details.backdrop_path,
          releaseDate: details.release_date,
          rating: details.vote_average,
          genres: details.genres.map((g) => g.name),
          featured: false,
          streamLinks: [],
        });
        await logActivity({
          action: 'add_movie',
          target: details.title,
          details: `Bulk added from TMDB`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
      } else {
        const existing = await getSeriesByTmdbId(item.id);
        if (existing) {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'exists' as const } : i)),
          );
          return;
        }
        const details = await seriesDetails(item.id);
        await addSeries({
          tmdbId: details.id,
          name: details.name,
          overview: details.overview,
          posterPath: details.poster_path,
          backdropPath: details.backdrop_path,
          firstAirDate: details.first_air_date,
          rating: details.vote_average,
          genres: details.genres.map((g) => g.name),
          featured: false,
          seasons: details.seasons
            .filter((s) => s.season_number > 0)
            .map((s) => ({ number: s.season_number, name: s.name, episodes: [] })),
        });
        await logActivity({
          action: 'add_series',
          target: details.name,
          details: `Bulk added from TMDB`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'added' as const } : i)),
      );
    } catch (e) {
      console.error('Failed to add:', e);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error' as const } : i)),
      );
    }
  };

  const addSelected = async () => {
    const selected = items.filter((i) => i.selected && i.status === 'idle');
    if (selected.length === 0) return;
    setAddingAll(true);
    setProgress({ done: 0, total: selected.length });
    for (const item of selected) {
      await addSingle(item);
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }
    setAddingAll(false);
    onComplete();
  };

  const selectedCount = items.filter((i) => i.selected && i.status === 'idle').length;
  const addedCount = items.filter((i) => i.status === 'added').length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {type === 'movie' ? <Film size={18} className="text-blue-400" /> : <Tv size={18} className="text-purple-400" />}
            <h3 className="text-white font-semibold">Bulk Add {type === 'movie' ? 'Movies' : 'Series'}</h3>
            {addedCount > 0 && (
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                {addedCount} added
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
          <Search size={16} className="text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${type === 'movie' ? 'movies' : 'series'} on TMDB...`}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <button onClick={selectAll} className="text-xs text-brand-primary hover:underline">Select all</button>
              <span className="text-white/20">|</span>
              <button onClick={deselectAll} className="text-xs text-white/50 hover:underline">Deselect all</button>
              <span className="text-xs text-white/30 ml-auto">{selectedCount} selected</span>
            </div>
          )}

          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-brand-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              Search and select content to add in bulk
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    item.selected ? 'bg-white/5' : 'opacity-50'
                  } ${item.status === 'added' ? 'bg-green-500/5' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    disabled={item.status !== 'idle'}
                    className="accent-brand-primary"
                  />
                  {item.poster_path ? (
                    <img src={posterURL(item.poster_path, 'w92')} alt="" className="w-8 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-12 rounded bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title || item.name}</p>
                    <p className="text-xs text-white/30">
                      {item.release_date || item.first_air_date || 'Unknown'} &middot; {item.vote_average?.toFixed(1) ?? 'N/A'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {item.status === 'idle' && (
                      <button onClick={() => addSingle(item)} className="p-1.5 rounded text-white/30 hover:text-green-400 hover:bg-green-400/10 transition-colors">
                        <Plus size={14} />
                      </button>
                    )}
                    {item.status === 'adding' && <Loader2 size={14} className="text-brand-primary animate-spin" />}
                    {item.status === 'added' && <Check size={14} className="text-green-400" />}
                    {item.status === 'exists' && <span className="text-xs text-yellow-400">Exists</span>}
                    {item.status === 'error' && <span className="text-xs text-red-400">Error</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
            {addingAll && (
              <span className="text-xs text-white/40">
                Adding... {progress.done}/{progress.total}
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <button
                onClick={addSelected}
                disabled={addingAll || selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
              >
                {addingAll ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Add {selectedCount} {type === 'movie' ? 'Movies' : 'Series'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
