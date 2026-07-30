// ============================================
// Settings Page — User preferences
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Palette, Play, Database, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import {
  getPlayerSettings,
  setPlayerSettings,
  clearWatchHistory,
} from '@/services/storage';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useSettings();
  const [playerPrefs, setPlayerPrefs] = useState(getPlayerSettings());

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Sign in to access settings</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const updatePlayerPref = <K extends keyof typeof playerPrefs>(
    key: K,
    value: (typeof playerPrefs)[K],
  ) => {
    const updated = { ...playerPrefs, [key]: value };
    setPlayerPrefs(updated);
    setPlayerSettings(updated);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Account */}
      <Section icon={<User size={18} />} title="Account">
        <Row label="Email" value={user?.email || 'Not signed in'} />
        <Row label="Display Name" value={user?.displayName || 'User'} />
      </Section>

      {/* Appearance */}
      <Section icon={<Palette size={18} />} title="Appearance">
        <Row label="Dark Mode">
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-brand-primary' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </Row>
      </Section>

      {/* Playback */}
      <Section icon={<Play size={18} />} title="Playback">
        <Row label="Auto-play next episode">
          <button
            onClick={() => updatePlayerPref('autoplayNext', !playerPrefs.autoplayNext)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              playerPrefs.autoplayNext ? 'bg-brand-primary' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                playerPrefs.autoplayNext ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </Row>
        <Row label="Default Quality">
          <select
            value={playerPrefs.defaultQuality}
            onChange={(e) => updatePlayerPref('defaultQuality', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-brand-primary"
          >
            <option value="auto">Auto</option>
            <option value="1080">1080p</option>
            <option value="720">720p</option>
            <option value="480">480p</option>
          </select>
        </Row>
        <Row label="Play in External Player">
          <select
            value={playerPrefs.externalPlayer}
            onChange={(e) => updatePlayerPref('externalPlayer', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-brand-primary"
          >
            <option value="">Disabled (In-app)</option>
            <option value="vlc">VLC Player</option>
            <option value="mx">MX Player</option>
            <option value="nplayer">nPlayer</option>
            <option value="infuse">Infuse</option>
            <option value="external">External Browser</option>
          </select>
        </Row>
      </Section>

      {/* Data */}
      <Section icon={<Database size={18} />} title="Data">
        <Row label="Clear Watch History">
          <button
            onClick={() => {
              if (confirm('Clear all watch history?')) clearWatchHistory();
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors"
          >
            Clear
          </button>
        </Row>
      </Section>

      {/* About */}
      <Section icon={<Info size={18} />} title="About">
        <Row label="Version" value="MVStream v3.0.0" />
        <Row label="Privacy Policy">
          <Link to="/privacy" className="text-brand-primary text-sm hover:underline">
            View &rarr;
          </Link>
        </Row>
        <Row label="Help">
          <Link to="/help" className="text-brand-primary text-sm hover:underline">
            View &rarr;
          </Link>
        </Row>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="text-white/40">{icon}</span>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/60">{label}</span>
      {value ? (
        <span className="text-sm text-white/80">{value}</span>
      ) : (
        children
      )}
    </div>
  );
}
