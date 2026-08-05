// ============================================
// PopUnder — Triggers popunder ad on first click
// ============================================

import { useState, useEffect } from 'react';
import { getEnabledAdsForPosition } from '@/services/ads';

export default function PopUnder() {
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (fired) return;

    const handleClick = () => {
      if (fired) return;
      setFired(true);

      getEnabledAdsForPosition('popup').then((results) => {
        const ad = results.flatMap((r) => r.ads)[0];
        if (!ad?.code) return;

        // Create a hidden iframe with the popunder URL
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;';
        document.body.appendChild(iframe);

        if (ad.code.startsWith('http')) {
          iframe.src = ad.code;
        } else {
          iframe.srcdoc = ad.code;
        }

        // Try to open in new window (popunder)
        try {
          const win = window.open(ad.code, '_blank');
          if (win) {
            win.blur();
            window.focus();
          }
        } catch { /* popup blocked */ }

        // Clean up iframe after a bit
        setTimeout(() => {
          iframe.remove();
        }, 5000);
      });
    };

    // Only trigger on user-initiated clicks
    document.addEventListener('click', handleClick, { once: true, capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [fired]);

  return null;
}
