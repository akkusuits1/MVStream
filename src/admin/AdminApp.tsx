// ============================================
// AdminApp — Main admin panel with sidebar
// ============================================

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { initAuth } from '@/services/auth';
import {
  LayoutDashboard,
  Film,
  Tv,
  FolderOpen,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ContentManager from './components/ContentManager';
import UserManager from './components/UserManager';
import SettingsPanel from './components/SettingsPanel';
import MovieRequestsManager from './components/MovieRequestsManager';
import { logout } from '@/services/auth';

type Tab = 'dashboard' | 'movies' | 'series' | 'categories' | 'users' | 'requests' | 'settings';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'series', label: 'Series', icon: Tv },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'requests', label: 'Requests', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const authLoading = useStore((s) => s.authLoading);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const unsub = initAuth(
      (u) => setUser(u),
      (l) => setAuthLoading(l),
    );
    return unsub;
  }, [setUser, setAuthLoading]);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-white/50 text-sm mb-6">Please log in with an admin account.</p>
          <a
            href="../index.html"
            className="inline-block px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-white/10 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <span className="text-brand-primary text-lg">&#9654;</span>
          <span className="text-white font-bold">MVStream</span>
          <span className="px-1.5 py-0.5 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded uppercase">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <a
            href="../index.html"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink size={18} />
            Back to Site
          </a>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
            <span className="text-sm text-white/40">Logged in as {user.displayName}</span>
          </div>

          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'movies' && <ContentManager type="movies" />}
          {activeTab === 'series' && <ContentManager type="series" />}
          {activeTab === 'categories' && <ContentManager type="categories" />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'requests' && <MovieRequestsManager />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}
