// ============================================
// AdBlockerDetector — Shows overlay when adblocker detected
// ============================================

import { useAdBlocker } from '@/hooks/useAdBlocker';
import { ShieldOff, RefreshCw } from 'lucide-react';

export default function AdBlockerDetector() {
  const { isBlocked, checking, config } = useAdBlocker();

  if (checking || !isBlocked || !config?.adBlockerEnabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 bg-neutral-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldOff size={32} className="text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-3">Ad Blocker Detected</h2>

        <p className="text-white/60 text-sm leading-relaxed mb-6">
          {config.adBlockerMessage}
        </p>

        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-4 text-left">
            <p className="text-white/80 text-sm font-medium mb-2">How to disable:</p>
            <ul className="text-white/50 text-xs space-y-1.5 list-disc list-inside">
              <li>Click your ad blocker extension icon in the browser toolbar</li>
              <li>Select "Pause" or "Disable on this site"</li>
              <li>Refresh this page</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>

          <p className="text-white/30 text-xs">
            Ads help us keep this service free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
