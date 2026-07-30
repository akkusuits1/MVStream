// ============================================
// Admin Settings Panel
// ============================================

import { Settings } from 'lucide-react';

export default function SettingsPanel() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
      <Settings size={48} className="mx-auto text-white/20 mb-4" />
      <p className="text-white/40">Admin settings coming soon.</p>
    </div>
  );
}
