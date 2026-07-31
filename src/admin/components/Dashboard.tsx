// ============================================
// Dashboard — Real Firebase stats overview
// ============================================

import { useState, useEffect } from 'react';
import { Film, Tv, Users, FolderOpen, Clock, Star } from 'lucide-react';
import { getDashboardStats, getMovies, getSeries } from '@/services/content';
import type { FirebaseMovie, FirebaseSeries } from '@/services/content';
import { posterURL } from '@/services/tmdb';
import { getMovieRequests } from '@/services/movieRequests';

interface Stats {
  totalMovies: number;
  totalSeries: number;
  totalCategories: number;
  totalUsers: number;
  pendingRequests: number;
  featuredMovies: number;
  featuredSeries: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMovies, setRecentMovies] = useState<FirebaseMovie[]>([]);
  const [recentSeries, setRecentSeries] = useState<FirebaseSeries[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [statsData, movies, series, requests] = await Promise.all([
        getDashboardStats(),
        getMovies(),
        getSeries(),
        getMovieRequests(),
      ]);
      setStats(statsData);
      setRecentMovies(movies.slice(0, 5));
      setRecentSeries(series.slice(0, 5));
      setPendingRequests(requests.filter((r) => r.status === 'pending').length);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Movies', value: stats?.totalMovies ?? 0, icon: Film, color: 'text-blue-400' },
    { label: 'Series', value: stats?.totalSeries ?? 0, icon: Tv, color: 'text-purple-400' },
    { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-green-400' },
    { label: 'Categories', value: stats?.totalCategories ?? 0, icon: FolderOpen, color: 'text-yellow-400' },
    { label: 'Pending Requests', value: pendingRequests, icon: Clock, color: 'text-orange-400' },
    { label: 'Featured', value: (stats?.featuredMovies ?? 0) + (stats?.featuredSeries ?? 0), icon: Star, color: 'text-pink-400' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <card.icon size={20} className={card.color} />
              <span className="text-sm text-white/50">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Film size={18} className="text-blue-400" />
            <h3 className="text-white font-medium">Recent Movies</h3>
          </div>
          {recentMovies.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No movies yet</p>
          ) : (
            <div className="space-y-2">
              {recentMovies.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  {m.posterPath ? (
                    <img src={posterURL(m.posterPath, 'w92')} alt={m.title} className="w-8 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-12 rounded bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{m.title}</p>
                    <p className="text-xs text-white/30">{m.releaseDate}</p>
                  </div>
                  <span className="text-xs text-white/40">{m.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tv size={18} className="text-purple-400" />
            <h3 className="text-white font-medium">Recent Series</h3>
          </div>
          {recentSeries.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No series yet</p>
          ) : (
            <div className="space-y-2">
              {recentSeries.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  {s.posterPath ? (
                    <img src={posterURL(s.posterPath, 'w92')} alt={s.name} className="w-8 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-12 rounded bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{s.name}</p>
                    <p className="text-xs text-white/30">{s.firstAirDate}</p>
                  </div>
                  <span className="text-xs text-white/40">{s.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
