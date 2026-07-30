// ============================================
// Player Page — Video Player with server selection
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Server, ExternalLink } from 'lucide-react';
import { buildPlayerURL, SERVERS } from '@/services/player';
import { getPlayerSettings } from '@/services/storage';
import { useAuth } from '@/hooks/useAuth';
import type { PlayerConfig } from '@/services/player';

const EXTERNAL_PLAYER_SCHEMES: Record<string, string> = {
  vlc: 'vlc://',
  mx: 'intent://',
  nplayer: 'nplayer-',
  infuse: 'infuse://x-callback-url/play?url=',
  external: '',
};

export default function PlayerPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const season = searchParams.get('season') ? Number(searchParams.get('season')) : undefined;
  const episode = searchParams.get('episode') ? Number(searchParams.get('episode')) : undefined;

  const [selectedServer, setSelectedServer] = useState('server-1');
  const [playerUrl, setPlayerUrl] = useState('');

  const config: PlayerConfig = {
    movieId: Number(id),
    type: type === 'series' ? 'series' : 'movie',
    season,
    episode,
    server: selectedServer,
  };

  useEffect(() => {
    const url = buildPlayerURL(config);
    setPlayerUrl(url);

    // Check if external player is configured
    const settings = getPlayerSettings();
    if (settings.externalPlayer && url) {
      const extPlayer = settings.externalPlayer;
      if (extPlayer === 'external') {
        // Open in external browser
        window.open(url, '_blank');
      } else if (extPlayer === 'vlc') {
        window.open(`vlc://${url}`, '_self');
      } else if (extPlayer === 'mx') {
        window.open(`intent:${url}#Intent;package=com.mxtech.videoplayer.ad;type=video/*;end`, '_self');
      } else if (extPlayer === 'nplayer') {
        window.open(`nplayer-${url}`, '_self');
      } else if (extPlayer === 'infuse') {
        window.open(`infuse://x-callback-url/play?url=${encodeURIComponent(url)}`, '_self');
      }
    }
  }, [selectedServer, id, type, season, episode]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Sign in to watch</p>
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link
        to={`/details/${type}/${id}`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Details
      </Link>

      {/* Player */}
      <div className="bg-neutral-900 rounded-xl overflow-hidden aspect-video mb-4">
        {playerUrl ? (
          <iframe
            src={playerUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Video Player"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Server Selection */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2 text-white/60 text-sm">
          <Server size={16} /> Server:
        </span>
        {SERVERS.map((server) => (
          <button
            key={server.id}
            onClick={() => setSelectedServer(server.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedServer === server.id
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {server.name}
            <span className="ml-1 text-xs opacity-60">{server.quality}</span>
          </button>
        ))}
      </div>

      {/* Season/Episode info */}
      {type === 'series' && season && episode && (
        <p className="text-white/40 text-sm mt-3">
          Season {season} &middot; Episode {episode}
        </p>
      )}
    </div>
  );
}
