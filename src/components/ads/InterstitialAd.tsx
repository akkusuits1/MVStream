// ============================================
// InterstitialAd — Full-screen overlay ad shown on navigation
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { getEnabledAdsForPosition } from '@/services/ads';
import type { AdUnit } from '@/services/ads';

const DISMISS_KEY = 'interstitial_last_shown';
const MIN_INTERVAL = 60_000; // 60s between interstitials

export default function InterstitialAd() {
  const [ad, setAd] = useState<AdUnit | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissable, setDismissable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Show interstitial on route change (with rate limiting)
  useEffect(() => {
    const lastShown = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    if (Date.now() - lastShown < MIN_INTERVAL) return;

    getEnabledAdsForPosition('interstitial').then((results) => {
      const allAds = results.flatMap((r) => r.ads);
      if (allAds.length === 0) return;
      setAd(allAds[0]);
      setVisible(true);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setDismissable(true), 5000);
      return () => clearTimeout(timer);
    });
  }, [pathname]);

  // Inject ad code
  useEffect(() => {
    if (!containerRef.current || !ad) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const code = ad.code;
    if (!code) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ad-unit';
    wrapper.setAttribute('data-ad-provider', ad.provider);
    wrapper.setAttribute('data-ad-type', ad.type);

    if (code.includes('<script')) {
      wrapper.innerHTML = code;
      const scripts = wrapper.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });
    } else {
      wrapper.innerHTML = code;
    }

    container.appendChild(wrapper);
  }, [ad]);

  if (!visible || !ad) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-zinc-900 rounded-xl max-w-lg w-full overflow-hidden">
        {/* Timer bar */}
        {!dismissable && (
          <div className="absolute top-0 left-0 h-1 bg-brand-primary animate-[shrink_5s_linear_forwards]" />
        )}

        {/* Close button */}
        {dismissable && (
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 z-10 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
          >
            <X size={18} />
          </button>
        )}

        {/* Ad content */}
        <div ref={containerRef} className="p-6 min-h-[200px] flex items-center justify-center" />

        {!dismissable && (
          <p className="text-center text-white/40 text-xs pb-3">
            Ad closes in {5 - Math.floor((Date.now() % 5000) / 1000)}s
          </p>
        )}
      </div>
    </div>
  );
}
