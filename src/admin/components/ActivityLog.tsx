// ============================================
// ActivityLog — View admin action history
// ============================================

import { useState, useEffect } from 'react';
import { Activity, RefreshCw, User, Film, Tv, FolderOpen, Settings, Clock, Shield } from 'lucide-react';
import { getActivityLog } from '@/services/activityLog';
import type { ActivityEntry } from '@/services/activityLog';

const actionIcons: Record<string, typeof Activity> = {
  add_movie: Film,
  add_series: Tv,
  delete_movie: Film,
  delete_series: Tv,
  add_category: FolderOpen,
  delete_category: FolderOpen,
  approve_request: Clock,
  reject_request: Clock,
  delete_request: Clock,
  update_settings: Settings,
  promote_user: Shield,
  demote_user: Shield,
  ban_user: Shield,
  unban_user: Shield,
  add_stream_link: Film,
  update_content: Film,
};

const actionColors: Record<string, string> = {
  add_movie: 'text-green-400',
  add_series: 'text-green-400',
  delete_movie: 'text-red-400',
  delete_series: 'text-red-400',
  add_category: 'text-yellow-400',
  delete_category: 'text-red-400',
  approve_request: 'text-green-400',
  reject_request: 'text-red-400',
  delete_request: 'text-red-400',
  update_settings: 'text-blue-400',
  promote_user: 'text-green-400',
  demote_user: 'text-orange-400',
  ban_user: 'text-red-400',
  unban_user: 'text-green-400',
  add_stream_link: 'text-blue-400',
  update_content: 'text-blue-400',
};

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getActivityLog(100);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white/40">{entries.length} recent actions</p>
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
      ) : entries.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Activity size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => {
            const Icon = actionIcons[entry.action] || Activity;
            const color = actionColors[entry.action] || 'text-white/40';
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`shrink-0 ${color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">
                    <span className="text-white/50">{entry.adminName}</span>{' '}
                    {entry.action.replace(/_/g, ' ')}{' '}
                    <span className="text-white font-medium">{entry.target}</span>
                  </p>
                  {entry.details && (
                    <p className="text-xs text-white/30 mt-0.5 truncate">{entry.details}</p>
                  )}
                </div>
                <span className="text-xs text-white/30 shrink-0">{formatTime(entry.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
