// ============================================
// useAdBlocker — Multi-layered adblocker detection
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { getAdConfig } from '@/services/ads';
import type { AdConfig } from '@/services/ads';

export function useAdBlocker() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [checking, setChecking] = useState(true);

  const detect = useCallback(async () => {
    if (!config?.adBlockerEnabled) {
      setIsBlocked(false);
      setChecking(false);
      return;
    }

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
        const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        // In no-cors mode, we can't read the response, but if it throws it's likely blocked
        void response;
      } catch {
        // Fetch blocked = likely adblocker (but could be network issue, so don't rely solely on this)
        // Only flag if bait method was suspicious
      }
    }

    // Method 3: CSS trap detection via style sheet
    if (!detected) {
      try {
        const testStyle = document.createElement('style');
        testStyle.textContent = '.ad_test_class { display: block !important; }';
        document.head.appendChild(testStyle);

        const testEl = document.createElement('div');
        testEl.className = 'ad_test_class';
        testEl.style.cssText = 'height:1px;width:1px;';
        document.body.appendChild(testEl);

        await new Promise((r) => setTimeout(r, 50));

        const computed = window.getComputedStyle(testEl);
        if (computed.display === 'none') {
          detected = true;
        }

        document.body.removeChild(testEl);
        document.head.removeChild(testStyle);
      } catch { /* ignore */ }
    }

    // Method 4: Known ad element checks
    if (!detected) {
      try {
        const adElements = [
          document.getElementById('google_ads_iframe'),
          document.querySelector('.adsbygoogle'),
          document.querySelector('[data-ad-client]'),
          document.querySelector('.ad-placement'),
        ];
        // If these elements exist but are hidden, adblocker is active
        for (const el of adElements) {
          if (el) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || el.offsetHeight === 0) {
              detected = true;
              break;
            }
          }
        }
      } catch { /* ignore */ }
    }

    setIsBlocked(detected);
    setChecking(false);
  }, [config]);

  // Load config
  useEffect(() => {
    getAdConfig().then((c) => {
      setConfig(c);
    });
  }, []);

  // Run detection when config is loaded
  useEffect(() => {
    if (config !== null) {
      detect();
      // Re-check periodically
      const interval = setInterval(detect, 30000);
      return () => clearInterval(interval);
    }
  }, [config, detect]);

  // Listen for DOM mutations (adblockers modify DOM)
  useEffect(() => {
    if (!config?.adBlockerEnabled) return;

    const observer = new MutationObserver(() => {
      detect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => observer.disconnect();
  }, [config, detect]);

  return { isBlocked, checking, config };
}
