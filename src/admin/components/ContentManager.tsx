// ============================================
// ContentManager — Manage movies & series in Firebase
// ============================================

import { useState, useEffect } from 'react';
import {
  Film, Tv, Plus, Trash2, Star, StarOff, ChevronDown, ChevronRight, Search, Package,
} from 'lucide-react';
import {
  getMovies, addMovie, deleteMovie, updateMovie,
  getSeries, addSeries, deleteSeries, updateSeries,
  getMovieByTmdbId, getSeriesByTmdbId,
} from '@/services/content';
import type { FirebaseMovie, FirebaseSeries } from '@/services/content';
import { posterURL, movieDetails, seriesDetails } from '@/services/tmdb';
import SearchModal from './SearchModal';
import BulkAddModal from './BulkAddModal';
import StreamLinkManager from './StreamLinkManager';
import SeasonEpisodeManager from './SeasonEpisodeManager';
import ConfirmDialog from './ConfirmDialog';
import type { StreamLink } from '@/services/player';
import { logActivity } from '@/services/activityLog';
import { useStore } from '@/store/useStore';

type ContentTab = 'movies' | 'series';

export default function ContentManager() {
  const [tab, setTab] = useState<ContentTab>('movies');
  const [movies, setMovies] = useState<FirebaseMovie[]>([]);
  const [series, setSeries] = useState<FirebaseSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'movie' | 'series'; id: string; title: string } | null>(null);
  const [contentSearch, setContentSearch] = useState('');
  const user = useStore((s) => s.user);

  const loadMovies = async () => {
    const data = await getMovies();
    setMovies(data);
  };

  const loadSeries = async () => {
    const data = await getSeries();
    setSeries(data);
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([loadMovies(), loadSeries()]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ---- Handle adding from TMDB search ----
  const handleAddFromTMDB = async (item: { id: number; title?: string; name?: string; media_type: 'movie' | 'series' }) => {
    setAdding(true);
    try {
      if (item.media_type === 'movie') {
        const existing = await getMovieByTmdbId(item.id);
        if (existing) {
          alert('This movie is already in your library.');
          setAdding(false);
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
          details: `Added from TMDB search`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
        await loadMovies();
      } else {
        const existing = await getSeriesByTmdbId(item.id);
        if (existing) {
          alert('This series is already in your library.');
          setAdding(false);
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
            .map((s) => ({
              number: s.season_number,
              name: s.name,
              episodes: [],
            })),
        });
        await logActivity({
          action: 'add_series',
          target: details.name,
          details: `Added from TMDB search`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
        await loadSeries();
      }
    } catch (e) {
      console.error('Failed to add:', e);
      alert('Failed to add content. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'movie') {
      await deleteMovie(deleteTarget.id);
      setMovies((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } else {
      await deleteSeries(deleteTarget.id);
      setSeries((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    }
    await logActivity({
      action: deleteTarget.type === 'movie' ? 'delete_movie' : 'delete_series',
      target: deleteTarget.title,
      details: 'Removed from library',
      adminUid: user?.uid || '',
      adminName: user?.displayName || user?.email || 'Admin',
    });
    setDeleteTarget(null);
  };

  const toggleFeatured = async (type: 'movie' | 'series', id: string, current: boolean) => {
    if (type === 'movie') {
      await updateMovie(id, { featured: !current });
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, featured: !current } : m)));
    } else {
      await updateSeries(id, { featured: !current });
      setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, featured: !current } : s)));
    }
  };

  const updateMovieLinks = async (id: string, links: StreamLink[]) => {
    await updateMovie(id, { streamLinks: links });
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, streamLinks: links } : m)));
  };

  const updateSeriesSeasons = async (id: string, seasons: FirebaseSeries['seasons']) => {
    await updateSeries(id, { seasons });
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, seasons } : s)));
  };

  const contentList = tab === 'movies' ? movies : series;
  const filteredContent = contentSearch
    ? contentList.filter((item) => {
        const title = 'title' in item ? item.title : (item as FirebaseSeries).name;
        return title.toLowerCase().includes(contentSearch.toLowerCase());
      })
    : contentList;

  return (
    <div>
      {/* Tabs + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'movies'
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Film size={16} />
            Movies
            <span className="text-xs opacity-70">({movies.length})</span>
          </button>
          <button
            onClick={() => setTab('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'series'
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Tv size={16} />
            Series
            <span className="text-xs opacity-70">({series.length})</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
          >
            <Package size={16} />
            Bulk Add
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            disabled={adding}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add {tab === 'movies' ? 'Movie' : 'Series'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {contentList.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors placeholder:text-white/30"
          />
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : contentList.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          {tab === 'movies' ? (
            <Film size={48} className="mx-auto text-white/20 mb-4" />
          ) : (
            <Tv size={48} className="mx-auto text-white/20 mb-4" />
          )}
          <p className="text-white/40 mb-4">
            No {tab} in your library yet
          </p>
          <button
            onClick={() => setSearchOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors"
          >
            Add First {tab === 'movies' ? 'Movie' : 'Series'}
          </button>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Search size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">
            No results for "{contentSearch}"
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContent.map((item) => {
            const id = item.id!;
            const title = 'title' in item ? item.title : (item as FirebaseSeries).name;
            const isExpanded = expandedId === id;

            return (
              <div key={id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                >
                  {isExpanded ? <ChevronDown size={16} className="text-white/40 shrink-0" /> : <ChevronRight size={16} className="text-white/40 shrink-0" />}

                  {item.posterPath ? (
                    <img
                      src={posterURL(item.posterPath, 'w92')}
                      alt={title}
                      className="w-10 h-[60px] rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-[60px] rounded bg-white/10 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{title}</p>
                      {item.featured && (
                        <Star size={12} className="text-yellow-400 shrink-0 fill-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-white/40">
                      {tab === 'movies' ? (item as FirebaseMovie).releaseDate : (item as FirebaseSeries).firstAirDate} &middot;{' '}
                      {item.rating?.toFixed(1) ?? 'N/A'} &middot;{' '}
                      {(Array.isArray(item.genres) ? item.genres : []).slice(0, 3).join(', ')}
                    </p>
                    {tab === 'movies' && (
                      <p className="text-xs text-white/30 mt-0.5">
                        {((item as FirebaseMovie).streamLinks ?? []).length} stream links
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFeatured(tab === 'movies' ? 'movie' : 'series', id, item.featured)}
                      className="p-2 rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      title={item.featured ? 'Unfeature' : 'Feature'}
                    >
                      {item.featured ? <Star size={16} className="fill-yellow-400" /> : <StarOff size={16} />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({
                        type: tab === 'movies' ? 'movie' : 'series',
                        id,
                        title,
                      })}
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4">
                    <p className="text-xs text-white/40 mb-3 line-clamp-2">{item.overview || 'No description available.'}</p>

                    {tab === 'movies' ? (
                      <div>
                        <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">Stream Links</h4>
                        <StreamLinkManager
                          links={(item as FirebaseMovie).streamLinks ?? []}
                          onChange={(links) => updateMovieLinks(id, links)}
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">Seasons & Episodes</h4>
                        <SeasonEpisodeManager
                          seasons={(item as FirebaseSeries).seasons ?? []}
                          onChange={(seasons) => updateSeriesSeasons(id, seasons)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddFromTMDB}
        type={tab === 'movies' ? 'movie' : 'series'}
      />

      {/* Bulk Add Modal */}
      <BulkAddModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onComplete={() => { loadMovies(); loadSeries(); }}
        type={tab === 'movies' ? 'movie' : 'series'}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'movie' ? 'Movie' : 'Series'}`}
        message={`Are you sure you want to remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
