// ============================================
// InPagePush — In-page push notification ad
// ============================================

import { useState, useEffect, useRef } from 'react';
import { getEnabledAdsForPosition } from '@/services/ads';
import { X } from 'lucide-react';

export default function InPagePush() {
  const [ads, setAds] = useState<{ code: string; mobileCode?: string }[]>([]);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasShown = useRef(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    getEnabledAdsForPosition('in-content').then((results) => {
      const pushAds = results
        .flatMap((r) => r.ads)
        .filter((a) => a.type === 'in-page-push');
      setAds(pushAds.map((a) => ({ code: a.code, mobileCode: a.mobileCode })));
    });
  }, []);

  // Show after 10 seconds delay
  useEffect(() => {
    if (ads.length === 0 || hasShown.current) return;
    const timer = setTimeout(() => {
      setVisible(true);
      hasShown.current = true;
    }, 10000);
    return () => clearTimeout(timer);
  }, [ads]);

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-40">
      <div className="relative bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={12} className="text-white" />
        </button>
        <div ref={containerRef} className="p-2" />
      </div>
    </div>
  );
}
