// ============================================
// User Manager — User list with role/status actions
// ============================================

import { useState, useEffect } from 'react';
import { Users, Shield, Ban, UserCheck } from 'lucide-react';
import { fetchAllUsers, updateUserRole, updateUserStatus } from '@/services/auth';
import { useStore } from '@/store/useStore';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  lastLogin: number;
}

export default function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useStore((s) => s.user);

  useEffect(() => {
    loadUsers();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-white/50">{users.length} users total</div>

      {users.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Users size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">No users yet</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-white/10 text-sm text-white/50 font-medium">
            <div>User</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Rows */}
          {users.map((u) => {
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
                        onClick={() => handleRoleToggle(u.uid, u.role)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Shield size={12} />
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => handleStatusToggle(u.uid, u.status)}
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
    </div>
  );
}
