// ============================================
// App — Root component with routing
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initAuth } from '@/services/auth';
import { useStore } from '@/store/useStore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AuthGuard from '@/components/ui/AuthGuard';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import BrowsePage from '@/pages/BrowsePage';
import SearchPage from '@/pages/SearchPage';
import DetailsPage from '@/pages/DetailsPage';
import PlayerPage from '@/pages/PlayerPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import AboutPage from '@/pages/AboutPage';
import HelpPage from '@/pages/HelpPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const setUser = useStore((s) => s.setUser);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const theme = useStore((s) => s.theme);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setUser(user),
      (loading) => setAuthLoading(loading),
    );
    return unsubscribe;
  }, [setUser, setAuthLoading]);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/movies" element={<BrowsePage />} />
            <Route path="/series" element={<BrowsePage />} />
            <Route path="/browse/:type" element={<BrowsePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/details/:type/:id" element={<DetailsPage />} />
            <Route
              path="/player/:type/:id"
              element={
                <AuthGuard>
                  <PlayerPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
