// ============================================
// Content Manager — Movies/Series/Categories list
// ============================================

import { useState, useEffect } from 'react';
import { Film, Tv, FolderOpen, Star } from 'lucide-react';
import { discoverMovies, discoverSeries } from '@/services/tmdb';
import { posterURL } from '@/services/tmdb';
import type { Movie, Series } from '@/types';

type ContentType = 'movies' | 'series' | 'categories';

export default function ContentManager({ type }: { type: ContentType }) {
  const [items, setItems] = useState<(Movie | Series)[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (type === 'movies') {
          const data = await discoverMovies(page);
          setItems(data.results);
          setTotalPages(Math.min(data.total_pages, 500));
        } else if (type === 'series') {
          const data = await discoverSeries(page);
          setItems(data.results);
          setTotalPages(Math.min(data.total_pages, 500));
        }
      } catch (e) {
        console.error('Failed to load content:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, type]);

  const Icon = type === 'movies' ? Film : type === 'series' ? Tv : FolderOpen;

  return (
    <div>
      {type === 'categories' ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <FolderOpen size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">Categories are synced from TMDB and managed automatically.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-white/10 text-sm text-white/50 font-medium">
              <div>Title</div>
              <div>Rating</div>
              <div>Year</div>
            </div>
            {items.map((item) => {
              const title = 'title' in item ? item.title : (item as Series).name;
              const year = ('release_date' in item && item.release_date)
                ? item.release_date.slice(0, 4)
                : ('first_air_date' in item && (item as Series).first_air_date)
                  ? (item as Series).first_air_date.slice(0, 4)
                  : 'N/A';
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b border-white/5 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.poster_path ? (
                      <img
                        src={posterURL(item.poster_path, 'w200')}
                        alt=""
                        className="w-8 h-12 rounded object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-12 rounded bg-white/10 shrink-0 flex items-center justify-center">
                        <Icon size={12} className="text-white/30" />
                      </div>
                    )}
                    <span className="text-sm text-white/80 truncate">{title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    {item.vote_average.toFixed(1)}
                  </div>
                  <div className="text-sm text-white/50 w-12 text-right">{year}</div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                Prev
              </button>
              <span className="text-sm text-white/50">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
