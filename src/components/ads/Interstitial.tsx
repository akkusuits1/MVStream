// ============================================
// Interstitial — Full-screen ad between page navigations
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getEnabledAdsForPosition } from '@/services/ads';
import { X, Clock } from 'lucide-react';

export default function Interstitial() {
  const [visible, setVisible] = useState(false);
  const [ads, setAds] = useState<{ code: string; mobileCode?: string }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const lastPath = useRef(location.pathname);
  const hasShown = useRef(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    getEnabledAdsForPosition('interstitial').then((results) => {
      const intAds = results.flatMap((r) => r.ads);
      setAds(intAds.map((a) => ({ code: a.code, mobileCode: a.mobileCode })));
    });
  }, []);

  // Show interstitial on route change (skip first load)
  useEffect(() => {
    if (lastPath.current !== location.pathname && !hasShown.current && ads.length > 0) {
      hasShown.current = true;
      setVisible(true);
      setCountdown(5);
      lastPath.current = location.pathname;
    } else {
      lastPath.current = location.pathname;
    }
  }, [location.pathname, ads]);

  // Countdown timer
  useEffect(() => {
    if (!visible || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [visible, countdown]);

  // Inject ad code
  useEffect(() => {
    if (!containerRef.current || !visible || ads.length === 0) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const ad = ads[0];
    if (!ad) return;
    const code = isMobile && ad.mobileCode ? ad.mobileCode : ad.code;
    if (!code) return;

    if (code.includes('<script')) {
      container.innerHTML = code;
      const scripts = container.querySelectorAll('script');
      scripts.forEach((old) => {
        const s = document.createElement('script');
        Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
        if (old.textContent) s.textContent = old.textContent;
        old.replaceWith(s);
      });
    } else {
      container.innerHTML = code;
    }
  }, [visible, ads, isMobile]);

  if (!visible || ads.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-lg w-full mx-4">
        <button
          onClick={() => countdown <= 0 && setVisible(false)}
          disabled={countdown > 0}
          className={`absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 transition-colors ${
            countdown > 0
              ? 'bg-neutral-800 text-white/30 cursor-not-allowed'
              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
          }`}
        >
          {countdown > 0 ? (
            <span className="text-xs font-mono">{countdown}</span>
          ) : (
            <X size={14} />
          )}
        </button>

        <div ref={containerRef} className="rounded-xl overflow-hidden bg-neutral-900 border border-white/10" />

        {countdown > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 text-white/40 text-xs">
            <Clock size={12} />
            <span>Ad closes in {countdown}s</span>
          </div>
        )}
      </div>
    </div>
  );
}
