// ============================================
// App — Root component with routing
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { initAuth } from '@/services/auth';
import { useStore } from '@/store/useStore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AuthGuard from '@/components/ui/AuthGuard';
import AdBlockerDetector from '@/components/AdBlockerDetector';
import AdSlot from '@/components/ads/AdSlot';
import SocialBar from '@/components/ads/SocialBar';
import InPagePush from '@/components/ads/InPagePush';
import InterstitialAd from '@/components/ads/InterstitialAd';
import ScrollToTop from '@/components/ScrollToTop';
import { usePageView } from '@/hooks/usePageView';

// GitHub Pages SPA redirect — restore clean URL from 404.html redirect
(function () {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, '', redirect);
  }
})();

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const DetailsPage = lazy(() => import('@/pages/DetailsPage'));
const PlayerPage = lazy(() => import('@/pages/PlayerPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const DisclaimerPage = lazy(() => import('@/pages/DisclaimerPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function AppInner() {
  usePageView();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <AdBlockerDetector />
      <InterstitialAd />
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto">
          <AdSlot position="header" className="w-full" />
        </div>
      </div>
      <main className="flex-1">
        <Suspense>
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
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <div className="max-w-7xl mx-auto">
        <AdSlot position="footer" className="w-full" />
      </div>
      <Footer />
      <MobileNav />
      <SocialBar />
      <InPagePush />
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  const setUser = useStore((s) => s.setUser);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setUser(user),
      (loading) => setAuthLoading(loading),
    );
    return unsubscribe;
  }, [setUser, setAuthLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const basename = window.location.pathname.startsWith('/MVStream') ? '/MVStream' : '';

  return (
    <BrowserRouter basename={basename}>
      <AppInner />
    </BrowserRouter>
  );
}
