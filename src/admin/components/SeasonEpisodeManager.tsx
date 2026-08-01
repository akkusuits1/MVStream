// ============================================
// SeasonEpisodeManager — Manage seasons & episodes for a series
// ============================================

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { SeriesSeason, SeasonEpisode } from '@/services/content';
import StreamLinkManager from './StreamLinkManager';
import type { StreamLink } from '@/services/player';

interface SeasonEpisodeManagerProps {
  seasons: SeriesSeason[];
  onChange: (seasons: SeriesSeason[]) => void;
  tmdbSeasons?: { season_number: number; name: string; episode_count: number }[];
  onImportFromTmdb?: () => void;
}

export default function SeasonEpisodeManager({
  seasons,
  onChange,
  tmdbSeasons,
}: SeasonEpisodeManagerProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<{ season: number; episode: number } | null>(null);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [showAddSeason, setShowAddSeason] = useState(false);

  const addSeason = (number: number, name?: string) => {
    if (seasons.find((s) => s.number === number)) return;
    const newSeason: SeriesSeason = {
      number,
      name: name || `Season ${number}`,
      episodes: [],
    };
    const updated = [...seasons, newSeason].sort((a, b) => a.number - b.number);
    onChange(updated);
  };

  const removeSeason = (seasonNumber: number) => {
    onChange(seasons.filter((s) => s.number !== seasonNumber));
    if (expandedSeason === seasonNumber) setExpandedSeason(null);
  };

  const addEpisode = (seasonNumber: number) => {
    const season = seasons.find((s) => s.number === seasonNumber);
    if (!season) return;
    const nextEpNum = (season.episodes ?? []).length + 1;
    const newEpisode: SeasonEpisode = {
      number: nextEpNum,
      name: `Episode ${nextEpNum}`,
      streamLinks: [],
    };
    const updated = seasons.map((s) =>
      s.number === seasonNumber ? { ...s, episodes: [...s.episodes, newEpisode] } : s,
    );
    onChange(updated);
  };

  const removeEpisode = (seasonNumber: number, episodeNumber: number) => {
    const updated = seasons.map((s) =>
      s.number === seasonNumber
        ? { ...s, episodes: s.episodes.filter((e) => e.number !== episodeNumber) }
        : s,
    );
    onChange(updated);
  };

  const updateEpisodeName = (seasonNumber: number, episodeNumber: number, name: string) => {
    const updated = seasons.map((s) =>
      s.number === seasonNumber
        ? {
            ...s,
            episodes: s.episodes.map((e) =>
              e.number === episodeNumber ? { ...e, name } : e,
            ),
          }
        : s,
    );
    onChange(updated);
  };

  const updateEpisodeLinks = (seasonNumber: number, episodeNumber: number, links: StreamLink[]) => {
    const updated = seasons.map((s) =>
      s.number === seasonNumber
        ? {
            ...s,
            episodes: s.episodes.map((e) =>
              e.number === episodeNumber ? { ...e, streamLinks: links } : e,
            ),
          }
        : s,
    );
    onChange(updated);
  };

  return (
    <div>
      {/* Import from TMDB */}
      {tmdbSeasons && tmdbSeasons.length > 0 && seasons.length === 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-blue-400 text-sm mb-2">
            Found {tmdbSeasons.length} seasons from TMDB. Import them?
          </p>
          <button
            onClick={() => {
              tmdbSeasons.forEach((s) => addSeason(s.season_number, s.name));
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Import {tmdbSeasons.length} Seasons
          </button>
        </div>
      )}

      {/* Seasons List */}
      <div className="space-y-2">
        {seasons.map((season) => (
          <div key={season.number} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Season Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedSeason(expandedSeason === season.number ? null : season.number)}
            >
              {expandedSeason === season.number ? (
                <ChevronDown size={16} className="text-white/40 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-white/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{season.name}</p>
                <p className="text-xs text-white/30">{(season.episodes ?? []).length} episodes</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSeason(season.number);
                }}
                className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Episodes (expanded) */}
            {expandedSeason === season.number && (
              <div className="border-t border-white/10 px-4 py-3">
                {(season.episodes ?? []).length === 0 ? (
                  <p className="text-xs text-white/30 mb-3">No episodes yet</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {season.episodes.map((ep) => (
                      <div key={ep.number} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {editingEpisode?.season === season.number && editingEpisode?.episode === ep.number ? (
                            <>
                              <input
                                type="text"
                                value={ep.name}
                                onChange={(e) => updateEpisodeName(season.number, ep.number, e.target.value)}
                                autoFocus
                                className="flex-1 bg-transparent text-white text-sm outline-none"
                              />
                              <button
                                onClick={() => setEditingEpisode(null)}
                                className="p-1 rounded text-green-400 hover:bg-green-400/10"
                              >
                                <Check size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-white/40 text-xs w-6 shrink-0">E{ep.number}</span>
                              <span className="text-white text-sm flex-1 truncate">{ep.name}</span>
                              <button
                                onClick={() => setEditingEpisode({ season: season.number, episode: ep.number })}
                                className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => removeEpisode(season.number, ep.number)}
                                className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                        {/* Stream Links for this episode */}
                        <StreamLinkManager
                          links={ep.streamLinks ?? []}
                          onChange={(links) => updateEpisodeLinks(season.number, ep.number, links)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => addEpisode(season.number)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                  <Plus size={14} />
                  Add Episode
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Season */}
      {showAddSeason ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            placeholder="Season number"
            autoFocus
            min="1"
            className="w-24 bg-white/10 text-white text-sm px-3 py-2 rounded-lg outline-none"
          />
          <button
            onClick={() => {
              const num = parseInt(newSeasonName);
              if (num > 0) {
                addSeason(num);
                setNewSeasonName('');
                setShowAddSeason(false);
              }
            }}
            className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => { setShowAddSeason(false); setNewSeasonName(''); }}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSeason(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 border border-dashed border-white/10 transition-colors w-full justify-center"
        >
          <Plus size={16} />
          Add Season
        </button>
      )}
    </div>
  );
}
