// ============================================
// User Manager — User list with search, filter, role/status actions
// ============================================

import { useState, useEffect } from 'react';
import { Users, Shield, Ban, UserCheck, Search, RefreshCw } from 'lucide-react';
import { fetchAllUsers, updateUserRole, updateUserStatus } from '@/services/auth';
import { useStore } from '@/store/useStore';
import ConfirmDialog from './ConfirmDialog';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  lastLogin: number;
}

type RoleFilter = 'all' | 'admin' | 'user';

export default function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'promote' | 'demote' | 'ban' | 'unban';
    uid: string;
    label: string;
  } | null>(null);
  const currentUser = useStore((s) => s.user);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(uid, newRole as 'user' | 'admin');
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
    } catch (e) {
      console.error('Failed to update role:', e);
    }
  };

  const handleStatusToggle = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
      await updateUserStatus(uid, newStatus as 'active' | 'banned');
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, status: newStatus } : u)),
      );
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    user: users.filter((u) => u.role === 'user').length,
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-1">
          {(['all', 'admin', 'user'] as RoleFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === f
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1 opacity-70">({roleCounts[f]})</span>
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={loadUsers}
          disabled={loading}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Users size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">
            {search || roleFilter !== 'all' ? 'No matching users' : 'No users yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-white/10 text-sm text-white/50 font-medium">
            <div>User</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filtered.map((u) => {
            const isCurrentUser = u.uid === currentUser?.uid;
            return (
              <div
                key={u.uid}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-white/5 items-center hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm text-white/80 truncate">{u.displayName || 'User'}</div>
                  <div className="text-xs text-white/40 truncate">{u.email}</div>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.role === 'admin' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/10 text-white/60'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    u.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {u.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentUser ? (
                    <span className="text-xs text-white/30">You</span>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmAction({
                          type: u.role === 'admin' ? 'demote' : 'promote',
                          uid: u.uid,
                          label: u.displayName || u.email,
                        })}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Shield size={12} />
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => setConfirmAction({
                          type: u.status === 'banned' ? 'unban' : 'ban',
                          uid: u.uid,
                          label: u.displayName || u.email,
                        })}
                        className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs transition-colors ${
                          u.status === 'banned'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                            : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {u.status === 'banned' ? <UserCheck size={12} /> : <Ban size={12} />}
                        {u.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'promote' ? 'Promote to Admin' :
          confirmAction?.type === 'demote' ? 'Demote from Admin' :
          confirmAction?.type === 'ban' ? 'Ban User' : 'Unban User'
        }
        message={
          confirmAction?.type === 'promote'
            ? `Give ${confirmAction?.label} admin privileges? They will have full access to the admin panel.`
            : confirmAction?.type === 'demote'
            ? `Remove admin privileges from ${confirmAction?.label}?`
            : confirmAction?.type === 'ban'
            ? `Ban ${confirmAction?.label}? They will not be able to access the site.`
            : `Unban ${confirmAction?.label}? They will regain access to the site.`
        }
        confirmLabel={
          confirmAction?.type === 'promote' ? 'Promote' :
          confirmAction?.type === 'demote' ? 'Demote' :
          confirmAction?.type === 'ban' ? 'Ban' : 'Unban'
        }
        danger={confirmAction?.type === 'ban'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'promote' || confirmAction.type === 'demote') {
            const user = users.find((u) => u.uid === confirmAction.uid);
            if (user) handleRoleToggle(confirmAction.uid, user.role);
          } else {
            const user = users.find((u) => u.uid === confirmAction.uid);
            if (user) handleStatusToggle(confirmAction.uid, user.status);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
