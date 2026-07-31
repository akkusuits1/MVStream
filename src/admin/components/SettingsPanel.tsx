// ============================================
// Admin Settings Panel — Firebase-backed site settings
// ============================================

import { useState, useEffect } from 'react';
import { Save, Globe, Shield, Zap, Loader2, Key } from 'lucide-react';
import { getSettings, updateSettings } from '@/services/content';
import type { SiteSettings } from '@/services/content';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-2xl">
      {/* Save Bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white/40">Configure site-wide settings</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Save size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* General */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-brand-primary" />
          <h3 className="text-white font-medium">General</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Site Description</label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => update('siteDescription', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Player Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-brand-primary" />
          <h3 className="text-white font-medium">Player</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Default Player</label>
            <select
              value={settings.defaultPlayer}
              onChange={(e) => update('defaultPlayer', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
            >
              <option value="auto" className="bg-neutral-900">Auto</option>
              <option value="server1" className="bg-neutral-900">Server 1</option>
              <option value="server2" className="bg-neutral-900">Server 2</option>
              <option value="server3" className="bg-neutral-900">Server 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Default Quality</label>
            <select
              value={settings.defaultQuality}
              onChange={(e) => update('defaultQuality', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
            >
              <option value="auto" className="bg-neutral-900">Auto</option>
              <option value="360p" className="bg-neutral-900">360p</option>
              <option value="480p" className="bg-neutral-900">480p</option>
              <option value="720p" className="bg-neutral-900">720p</option>
              <option value="1080p" className="bg-neutral-900">1080p</option>
              <option value="4K" className="bg-neutral-900">4K</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key size={18} className="text-brand-primary" />
          <h3 className="text-white font-medium">API Keys</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">TMDB API Key</label>
            <input
              type="password"
              value={settings.tmdbApiKey}
              onChange={(e) => update('tmdbApiKey', e.target.value)}
              placeholder="Enter your TMDB API key"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
            />
            <p className="text-xs text-white/30 mt-1.5">
              Used for movie/series search and details. Get yours at{' '}
              <span className="text-brand-primary">themoviedb.org</span>
            </p>
          </div>
        </div>
      </div>

      {/* Security & Maintenance */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-brand-primary" />
          <h3 className="text-white font-medium">Security & Maintenance</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-white/80">Maintenance Mode</p>
              <p className="text-xs text-white/40">Show maintenance page to all non-admin users</p>
            </div>
            <button
              onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-brand-primary' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-white/80">Ads Enabled</p>
              <p className="text-xs text-white/40">Show advertisements on the site</p>
            </div>
            <button
              onClick={() => update('adsEnabled', !settings.adsEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.adsEnabled ? 'bg-brand-primary' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.adsEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
