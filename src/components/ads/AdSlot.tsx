// ============================================
// AdSlot — Renders ads from a specific placement zone
// ============================================

import { useState, useEffect, useRef } from 'react';
import { getEnabledAdsForPosition } from '@/services/ads';
import type { AdUnit, PlacementPosition } from '@/services/ads';

interface AdSlotProps {
  position: PlacementPosition;
  className?: string;
}

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  const [ads, setAds] = useState<AdUnit[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getEnabledAdsForPosition(position).then((results) => {
      const allAds = results.flatMap((r) => r.ads);
      setAds(allAds);
    });

    // Refresh ads every 30 seconds for long sessions
    const interval = setInterval(() => {
      getEnabledAdsForPosition(position).then((results) => {
        const allAds = results.flatMap((r) => r.ads);
        setAds(allAds);
      });
    }, 30_000);

    return () => clearInterval(interval);
  }, [position]);

  // Inject ad codes after render
  useEffect(() => {
    if (!containerRef.current || ads.length === 0) return;

    const container = containerRef.current;
    // Clear previous
    container.innerHTML = '';

    ads.forEach((ad) => {
      const code = isMobile && ad.mobileCode ? ad.mobileCode : ad.code;
      if (!code) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'ad-unit';
      wrapper.setAttribute('data-ad-provider', ad.provider);
      wrapper.setAttribute('data-ad-type', ad.type);

      // If it's a script-based ad, inject carefully
      if (code.includes('<script')) {
        wrapper.innerHTML = code;
        // Execute scripts in the wrapper
        const scripts = wrapper.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }
          oldScript.replaceWith(newScript);
        });
      } else if (code.includes('<ins') || code.includes('adsbygoogle')) {
        // AdSense format
        wrapper.innerHTML = code;
        const scripts = wrapper.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          }
          oldScript.replaceWith(newScript);
        });
      } else {
        // Raw HTML/iframe
        wrapper.innerHTML = code;
      }

      container.appendChild(wrapper);
    });
  }, [ads, isMobile]);

  if (ads.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`ad-slot ad-slot-${position} flex justify-center items-center overflow-hidden ${className}`}
      data-position={position}
    />
  );
}
