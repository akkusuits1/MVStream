// ============================================
// Admin App — Dashboard panel for admin users
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Film, Tv, FolderOpen, Users, Clock, Settings, LogOut, Moon, Sun, Menu, Lock, Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useStore } from '@/store/useStore';
import { initAuth } from '@/services/auth';

import Dashboard from './components/Dashboard';
import ContentManager from './components/ContentManager';
import CategoriesManager from './components/CategoriesManager';
import UserManager from './components/UserManager';
import MovieRequestsManager from './components/MovieRequestsManager';
import SettingsPanel from './components/SettingsPanel';
import ActivityLog from './components/ActivityLog';

type Tab = 'dashboard' | 'movies' | 'series' | 'categories' | 'users' | 'requests' | 'activity' | 'settings';

const navItems: { tab: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'movies', label: 'Movies', icon: Film },
  { tab: 'series', label: 'Series', icon: Tv },
  { tab: 'categories', label: 'Categories', icon: FolderOpen },
  { tab: 'users', label: 'Users', icon: Users },
  { tab: 'requests', label: 'Requests', icon: Clock },
  { tab: 'activity', label: 'Activity Log', icon: Activity },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useSettings();
  const authLoading = useStore((s) => s.authLoading);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => useStore.getState().setUser(user),
      (loading) => useStore.getState().setAuthLoading(loading),
    );
    return unsubscribe;
  }, []);

  // Apply theme class on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <Lock size={28} className="text-white/40" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Admin Access Required</h1>
          <p className="text-white/50 mb-6">
            You need to be logged in with an admin account to access this page.
          </p>
          {isAuthenticated ? (
            <p className="text-sm text-white/40">
              Logged in as {user?.email} — this account does not have admin access.
            </p>
          ) : (
            <a
              href="./index.html"
              className="inline-block px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
            >
              Go to Login
            </a>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'movies':
      case 'series': return <ContentManager />;
      case 'categories': return <CategoriesManager />;
      case 'users': return <UserManager />;
      case 'requests': return <MovieRequestsManager />;
      case 'activity': return <ActivityLog />;
      case 'settings': return <SettingsPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu size={18} />
          </button>
          <Link to="/" className="text-brand-primary text-lg">&#9654;</Link>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/"
            className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            View Site
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-xs text-white/40 max-w-[120px] truncate">{user.displayName || user.email}</span>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 left-0 h-[calc(100vh-3.5rem)] w-56 bg-black/95 border-r border-white/10 z-40 transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.tab
                    ? 'bg-brand-primary text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-[calc(100vh-3.5rem)]">
          <h2 className="text-xl font-bold text-white mb-6">
            {navItems.find((n) => n.tab === activeTab)?.label}
          </h2>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
