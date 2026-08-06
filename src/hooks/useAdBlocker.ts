// ============================================
// useAdBlocker — Multi-layered adblocker detection
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdConfig } from '@/services/ads';
import type { AdConfig } from '@/services/ads';

export function useAdBlocker() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [checking, setChecking] = useState(true);
  const detectingRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  const detect = useCallback(async () => {
    // Prevent concurrent runs
    if (detectingRef.current || !config?.adBlockerEnabled) {
      if (!config?.adBlockerEnabled) {
        setIsBlocked(false);
        setChecking(false);
      }
      return;
    }
    detectingRef.current = true;

    // Pause observer during detection to avoid feedback loop
    observerRef.current?.disconnect();

    let detected = false;

    // Method 1: Bait element detection
    try {
      const bait = document.createElement('div');
      bait.className = 'ad-zone ad-banner google-ad adsense-ad doubleclick-ad';
      bait.id = 'google_ads_iframe';
      bait.style.cssText = 'height:1px;width:1px;position:absolute;left:-999px;top:-999px;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      await new Promise((r) => setTimeout(r, 100));

      const baitStyles = window.getComputedStyle(bait);
      if (
        baitStyles.display === 'none' ||
        baitStyles.visibility === 'hidden' ||
        baitStyles.opacity === '0' ||
        bait.offsetHeight === 0 ||
        baitStyles.height === '0px' ||
        baitStyles.width === '0px'
      ) {
        detected = true;
      }
      document.body.removeChild(bait);
    } catch { /* ignore */ }

    // Method 2: Script fetch detection
    if (!detected) {
      try {
        const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(testUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        // In no-cors mode, opaque response (status 0) means the request went through
        if (response.type === 'opaque') {
          // Ad server reachable — not blocked
        } else if (!response.ok) {
          detected = true;
        }
      } catch {
        // Fetch failed — likely blocked
        detected = true;
      }
    }

    // Method 3: CSS trap detection
    if (!detected) {
      try {
        const testEl = document.createElement('div');
        testEl.innerHTML = '&nbsp;';
        testEl.className = 'adsbox ad-unit ads-banner';
        testEl.style.cssText = 'position:absolute;top:-10px;left:-10px;height:1px;width:1px;';
        document.body.appendChild(testEl);

        await new Promise((r) => setTimeout(r, 50));

        if (
          testEl.offsetHeight === 0 ||
          window.getComputedStyle(testEl).display === 'none'
        ) {
          detected = true;
        }
        document.body.removeChild(testEl);
      } catch { /* ignore */ }
    }

    setIsBlocked(detected);
    setChecking(false);
    detectingRef.current = false;

    // Re-attach observer after detection
    attachObserver();
  }, [config]);

  const attachObserver = useCallback(() => {
    observerRef.current?.disconnect();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    observerRef.current = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        detect();
      }, 1000);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  }, [detect]);

  // Load config once, then run detection after page is ready
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const adConfig = await getAdConfig();
      if (cancelled) return;
      setConfig(adConfig);

      // Wait for page to finish loading before detecting
      const runDetection = () => detect();
      if (document.readyState === 'complete') {
        // Page already loaded, wait a bit for ad scripts to run
        setTimeout(runDetection, 3000);
      } else {
        window.addEventListener('load', () => setTimeout(runDetection, 3000), { once: true });
      }
    };

    init();
    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isBlocked, config, checking };
}
