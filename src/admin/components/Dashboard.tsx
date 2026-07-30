// ============================================
// Admin Dashboard — Stats overview
// ============================================

import { useState, useEffect } from 'react';
import { Film, Tv, FolderOpen, Users } from 'lucide-react';
import { discoverMovies, discoverSeries } from '@/services/tmdb';
import { fetchAllUsers } from '@/services/auth';

export default function Dashboard() {
  const [stats, setStats] = useState({ movies: 0, series: 0, categories: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [moviesData, seriesData, users] = await Promise.all([
          discoverMovies(1),
          discoverSeries(1),
          fetchAllUsers(),
        ]);
        setStats({
          movies: moviesData.total_results,
          series: seriesData.total_results,
          categories: 0,
          users: users.length,
        });
      } catch (e) {
        console.error('Failed to load dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Movies', value: stats.movies, icon: Film, color: '#E50914' },
    { label: 'Total Series', value: stats.series, icon: Tv, color: '#FF6B35' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: '#00D4AA' },
    { label: 'Users', value: stats.users, icon: Users, color: '#FFB800' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon size={24} style={{ color: stat.color }} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-white/50">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
