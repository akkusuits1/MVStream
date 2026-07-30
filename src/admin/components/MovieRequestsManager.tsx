import { useState, useEffect } from 'react';
import { Check, X, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  getMovieRequests,
  updateRequestStatus,
  deleteRequest,
} from '@/services/movieRequests';
import type { MovieRequest } from '@/services/movieRequests';
import { posterURL } from '@/services/tmdb';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function MovieRequestsManager() {
  const [requests, setRequests] = useState<MovieRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');

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
    await updateRequestStatus(id, 'approved');
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)),
    );
  };

  const handleReject = async (id: string) => {
    await updateRequestStatus(id, 'rejected');
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40">
            {filter === 'pending'
              ? 'No pending requests'
              : `No ${filter} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
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
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(req.id!)}
                      className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(req.id!)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
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
                  onClick={() => handleDelete(req.id!)}
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
    </div>
  );
}
