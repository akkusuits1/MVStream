// ============================================
// MovieRequestsManager — Manage user movie requests
// ============================================

import { useState, useEffect } from 'react';
import { Check, X, Trash2, CheckCircle, XCircle, RefreshCw, Plus, Loader2 } from 'lucide-react';
import {
  getMovieRequests,
  updateRequestStatus,
  deleteRequest,
} from '@/services/movieRequests';
import type { MovieRequest } from '@/services/movieRequests';
import { posterURL, movieDetails, seriesDetails } from '@/services/tmdb';
import { addMovie, addSeries, getMovieByTmdbId, getSeriesByTmdbId } from '@/services/content';
import { logActivity } from '@/services/activityLog';
import { useStore } from '@/store/useStore';
import ConfirmDialog from './ConfirmDialog';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function MovieRequestsManager() {
  const [requests, setRequests] = useState<MovieRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [deleteTarget, setDeleteTarget] = useState<MovieRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [quickAddId, setQuickAddId] = useState<string | null>(null);
  const user = useStore((s) => s.user);

  const handleQuickAdd = async (request: MovieRequest) => {
    if (!request.tmdbId) return;
    setQuickAddId(request.id!);
    try {
      if (request.type === 'movie') {
        const existing = await getMovieByTmdbId(request.tmdbId);
        if (existing) {
          alert('This movie is already in your library.');
          setQuickAddId(null);
          return;
        }
        const details = await movieDetails(request.tmdbId);
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
          details: `Quick-added from user request by ${request.userName || 'user'}`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
      } else {
        const existing = await getSeriesByTmdbId(request.tmdbId);
        if (existing) {
          alert('This series is already in your library.');
          setQuickAddId(null);
          return;
        }
        const details = await seriesDetails(request.tmdbId);
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
          details: `Quick-added from user request by ${request.userName || 'user'}`,
          adminUid: user?.uid || '',
          adminName: user?.displayName || user?.email || 'Admin',
        });
      }
      // Mark request as approved after adding
      await updateRequestStatus(request.id!, 'approved');
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: 'approved' as const } : r)),
      );
    } catch (e) {
      console.error('Quick add failed:', e);
      alert('Failed to add content. Please try again.');
    } finally {
      setQuickAddId(null);
    }
  };

  const load = async () => {
    setLoading(true);
    const data = await getMovieRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await updateRequestStatus(id, 'approved');
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)),
    );
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await updateRequestStatus(id, 'rejected');
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)),
    );
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Filters + Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40">
            {filter === 'pending'
              ? 'No pending requests — all caught up!'
              : `No ${filter} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-opacity ${
                processingId === req.id ? 'opacity-50' : ''
              }`}
            >
              {req.posterPath ? (
                <img
                  src={posterURL(req.posterPath, 'w92')}
                  alt={req.title}
                  className="w-12 h-[72px] rounded object-cover shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-[72px] rounded bg-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{req.title}</h3>
                <p className="text-sm text-white/40">
                  {req.type === 'series' ? 'Series' : 'Movie'} &middot;{' '}
                  Requested by {req.userName}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {new Date(req.createdAt).toLocaleDateString()} &middot;{' '}
                  TMDB #{req.tmdbId}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'pending' ? (
                  <>
                    {req.tmdbId && (
                      <button
                        onClick={() => handleQuickAdd(req)}
                        disabled={quickAddId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
                        title="Approve & Add to Library"
                      >
                        {quickAddId === req.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={12} />
                        )}
                        Quick Add
                      </button>
                    )}
                    <button
                      onClick={() => handleApprove(req.id!)}
                      disabled={processingId === req.id}
                      className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(req.id!)}
                      disabled={processingId === req.id}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      req.status === 'approved'
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-red-400/10 text-red-400'
                    }`}
                  >
                    {req.status === 'approved' ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                )}
                <button
                  onClick={() => setDeleteTarget(req)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Request"
        message={`Are you sure you want to delete the request for "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id!)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
