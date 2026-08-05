// ============================================
// SocialBar — Fixed floating social bar ad
// ============================================

import { useState, useEffect, useRef } from 'react';
import { getEnabledAdsForPosition } from '@/services/ads';
import { X } from 'lucide-react';

export default function SocialBar() {
  const [ads, setAds] = useState<{ code: string; mobileCode?: string }[]>([]);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    getEnabledAdsForPosition('sidebar').then((results) => {
      const socialAds = results
        .flatMap((r) => r.ads)
        .filter((a) => a.type === 'socialbar');
      setAds(socialAds.map((a) => ({ code: a.code, mobileCode: a.mobileCode })));
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || ads.length === 0) return;
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
  }, [ads, isMobile]);

  if (!visible || ads.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-50 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center border border-white/20"
      >
        <X size={12} className="text-white" />
      </button>
    </div>
  );
}
