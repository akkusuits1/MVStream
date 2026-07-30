// ============================================
// Profile Page — User profile, watchlist, history
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Clock, BookmarkPlus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getWatchHistory, getWatchlist, removeFromWatchlist } from '@/services/storage';
import { posterURL, movieDetails, seriesDetails } from '@/services/tmdb';
import { timeAgo } from '@/lib/utils';
import type { MovieDetails, SeriesDetails } from '@/types';

type Tab = 'watchlist' | 'history';

interface WatchlistItem {
  id: number;
  type: 'movie' | 'series';
  title: string;
  posterPath: string | null;
  rating: number;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  // Fetch watchlist details
  useEffect(() => {
    if (!isAuthenticated) return;
    setWatchlistLoading(true);
    const ids = getWatchlist();
    if (ids.length === 0) {
      setWatchlistItems([]);
      setWatchlistLoading(false);
      return;
    }

    Promise.all(
      ids.map(async (id) => {
        try {
          // Try movie first, then series
          let data: MovieDetails | SeriesDetails;
          let type: 'movie' | 'series' = 'movie';
          try {
            data = await movieDetails(id);
          } catch {
            data = await seriesDetails(id);
            type = 'series';
          }
          const isMovie = 'title' in data;
          return {
            id,
            type,
            title: isMovie ? (data as MovieDetails).title : (data as SeriesDetails).name,
            posterPath: data.poster_path,
            rating: data.vote_average,
          };
        } catch {
          return {
            id,
            type: 'movie' as const,
            title: `Title #${id}`,
            posterPath: null,
            rating: 0,
          };
        }
      }),
    ).then((items) => {
      setWatchlistItems(items);
      setWatchlistLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <User size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60 text-lg mb-4">Sign in to view your profile</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const watchHistory = getWatchHistory();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <User size={24} className="text-white/40" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user?.displayName || 'User'}</h1>
            <p className="text-white/50 text-sm">{user?.email}</p>
          </div>
          <Link
            to="/settings"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
        {(['watchlist', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {tab === 'watchlist' ? <BookmarkPlus size={16} /> : <Clock size={16} />}
            {tab === 'watchlist' ? 'Watchlist' : 'History'}
          </button>
        ))}
      </div>

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlistLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
            </div>
          ) : watchlistItems.length === 0 ? (
            <EmptyState
              icon={<BookmarkPlus size={48} />}
              title="Watchlist is empty"
              description="Add movies and series to your watchlist to watch later"
            />
          ) : (
            <div className="space-y-3">
              {watchlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <Link
                    to={`/details/${item.type}/${item.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    {item.posterPath ? (
                      <img
                        src={posterURL(item.posterPath, 'w92')}
                        alt={item.title}
                        className="w-12 h-[72px] rounded object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-[72px] rounded bg-white/10 shrink-0 flex items-center justify-center text-white/20 text-xs">
                        N/A
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-brand-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/40">
                        {item.type === 'series' ? 'Series' : 'Movie'}
                        {item.rating > 0 && <> &middot; ★ {item.rating.toFixed(1)}</>}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      removeFromWatchlist(item.id);
                      setWatchlistItems((prev) => prev.filter((w) => w.id !== item.id));
                    }}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {watchHistory.length === 0 ? (
            <EmptyState
              icon={<Clock size={48} />}
              title="No watch history"
              description="Start watching to build your history"
            />
          ) : (
            <div className="space-y-3">
              {watchHistory.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={`/details/${item.type}/${item.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  {item.posterPath ? (
                    <img
                      src={posterURL(item.posterPath, 'w92')}
                      alt={item.title}
                      className="w-12 h-18 rounded object-cover shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-18 rounded bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium group-hover:text-brand-primary transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/40">
                      {item.type === 'series' && item.season
                        ? `S${item.season} E${item.episode || '?'}`
                        : 'Movie'}
                      {' '}&middot; {timeAgo(item.timestamp)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="h-20 sm:h-0" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-white/20 mb-4 flex justify-center">{icon}</div>
      <p className="text-white/40 text-lg mb-1">{title}</p>
      <p className="text-white/30 text-sm">{description}</p>
    </div>
  );
}
