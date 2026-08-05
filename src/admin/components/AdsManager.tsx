// ============================================
// AdsManager — Admin ads management dashboard
// ============================================

import { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Trash2, ChevronDown, ChevronRight, Settings,
  Shield, ToggleLeft, ToggleRight, Code, ExternalLink,
} from 'lucide-react';
import {
  getPlacements, getAdConfig, updateAdConfig, deletePlacement,
  deleteAdUnit, updateAdUnit,
} from '@/services/ads';
import type { AdPlacement, AdUnit, AdConfig } from '@/services/ads';
import PlacementEditor from './PlacementEditor';
import AdEditor from './AdEditor';
import ConfirmDialog from './ConfirmDialog';

const TYPE_LABELS: Record<string, string> = {
  banner: 'Banner',
  native: 'Native Banner',
  popunder: 'Popunder',
  socialbar: 'Social Bar',
  smartlink: 'SmartLink',
  push: 'Push Notification',
  'in-page-push': 'In-Page Push',
};

const PROVIDER_LABELS: Record<string, string> = {
  adsense: 'AdSense',
  adsterra: 'Adsterra',
  monatag: 'Monatag',
};

const POSITION_LABELS: Record<string, string> = {
  header: 'Header Banner',
  sidebar: 'Sidebar',
  'in-content': 'In-Content',
  footer: 'Footer Banner',
  popup: 'Popunder',
  interstitial: 'Interstitial',
};

export default function AdsManager() {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Editors
  const [placementEditorOpen, setPlacementEditorOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [adEditorOpen, setAdEditorOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdUnit | null>(null);
  const [adEditorPlacementId, setAdEditorPlacementId] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'placement' | 'ad'; placementId: string; adId?: string; title: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([getPlacements(), getAdConfig()]);
    setPlacements(p);
    setConfig(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleConfig = async (key: keyof AdConfig, value: boolean | string) => {
    if (!config) return;
    const updated = { ...config, [key]: value };
    setConfig(updated);
    await updateAdConfig({ [key]: value });
  };

  const toggleAdEnabled = async (placementId: string, ad: AdUnit) => {
    const newEnabled = !ad.enabled;
    await updateAdUnit(placementId, ad.id!, { enabled: newEnabled });
    setPlacements((prev) =>
      prev.map((p) =>
        p.id === placementId
          ? { ...p, ads: p.ads.map((a) => (a.id === ad.id ? { ...a, enabled: newEnabled } : a)) }
          : p
      )
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'placement') {
      await deletePlacement(deleteTarget.placementId);
      setPlacements((prev) => prev.filter((p) => p.id !== deleteTarget.placementId));
    } else if (deleteTarget.adId) {
      await deleteAdUnit(deleteTarget.placementId, deleteTarget.adId);
      setPlacements((prev) =>
        prev.map((p) =>
          p.id === deleteTarget.placementId
            ? { ...p, ads: p.ads.filter((a) => a.id !== deleteTarget.adId) }
            : p
        )
      );
    }
    setDeleteTarget(null);
  };

  const totalAds = placements.reduce((sum, p) => sum + p.ads.length, 0);
  const activeAds = placements.reduce((sum, p) => sum + p.ads.filter((a) => a.enabled).length, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Placements', value: placements.length },
          { label: 'Total Ads', value: totalAds },
          { label: 'Active Ads', value: activeAds },
          { label: 'Ad Blocker', value: config?.adBlockerEnabled ? 'On' : 'Off' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ad Blocker Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={18} className="text-brand-primary" />
          <h3 className="text-sm font-semibold text-white">Ad Blocker Detection</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Detect ad blockers and show a warning message</p>
            <p className="text-xs text-white/40 mt-0.5">Content will be blurred until ad blocker is disabled</p>
          </div>
          <button
            onClick={() => toggleConfig('adBlockerEnabled', !config?.adBlockerEnabled)}
            className="flex items-center"
          >
            {config?.adBlockerEnabled ? (
              <ToggleRight size={32} className="text-brand-primary" />
            ) : (
              <ToggleLeft size={32} className="text-white/30" />
            )}
          </button>
        </div>
        {config?.adBlockerEnabled && (
          <div className="mt-3">
            <label className="block text-white/50 text-xs mb-1">Warning Message</label>
            <textarea
              value={config.adBlockerMessage}
              onChange={(e) => toggleConfig('adBlockerMessage', e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors resize-none"
            />
          </div>
        )}
      </div>

      {/* Placements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Megaphone size={16} />
            Ad Placements
          </h3>
          <button
            onClick={() => { setEditingPlacement(null); setPlacementEditorOpen(true); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors"
          >
            <Plus size={14} /> New Placement
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
          </div>
        ) : placements.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <Megaphone size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40 text-sm mb-3">No ad placements yet</p>
            <button
              onClick={() => { setEditingPlacement(null); setPlacementEditorOpen(true); }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors"
            >
              Create First Placement
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {placements.map((placement) => {
              const isExpanded = expandedId === placement.id;
              return (
                <div key={placement.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Placement Row */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : (placement.id ?? null))}
                  >
                    {isExpanded ? <ChevronDown size={16} className="text-white/40 shrink-0" /> : <ChevronRight size={16} className="text-white/40 shrink-0" />}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{placement.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                          {POSITION_LABELS[placement.position]}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {placement.ads.length} ad{placement.ads.length !== 1 ? 's' : ''} &middot;{' '}
                        {placement.ads.filter((a) => a.enabled).length} active
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleConfig('adBlockerEnabled', !config?.adBlockerEnabled)}
                        className={`p-1.5 rounded-lg transition-colors ${placement.enabled ? 'text-green-400' : 'text-white/30'}`}
                        title={placement.enabled ? 'Enabled' : 'Disabled'}
                      >
                        {placement.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => { setEditingPlacement(placement); setPlacementEditorOpen(true); }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'placement', placementId: placement.id!, title: placement.name })}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Ads list */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide">Ads in this placement</h4>
                        <button
                          onClick={() => { setEditingAd(null); setAdEditorPlacementId(placement.id!); setAdEditorOpen(true); }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 transition-colors"
                        >
                          <Plus size={12} /> Add Ad
                        </button>
                      </div>

                      {placement.ads.length === 0 ? (
                        <p className="text-xs text-white/30 py-4 text-center">No ads in this placement</p>
                      ) : (
                        <div className="space-y-2">
                          {placement.ads.map((ad) => (
                            <div key={ad.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-white truncate">{ad.name}</p>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                                    {PROVIDER_LABELS[ad.provider]}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">
                                    {TYPE_LABELS[ad.type]}
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/30 mt-0.5">
                                  Size: {ad.size} &middot; {ad.mobileCode ? 'Has mobile code' : 'Desktop only'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => toggleAdEnabled(placement.id!, ad)}
                                  className={`p-1.5 rounded-lg transition-colors ${ad.enabled ? 'text-green-400' : 'text-white/30'}`}
                                  title={ad.enabled ? 'Enabled' : 'Disabled'}
                                >
                                  {ad.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button
                                  onClick={() => { setEditingAd(ad); setAdEditorPlacementId(placement.id!); setAdEditorOpen(true); }}
                                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                                  title="Edit"
                                >
                                  <Code size={12} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: 'ad', placementId: placement.id!, adId: ad.id, title: ad.name })}
                                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider Quick Links */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ExternalLink size={14} />
          Provider Dashboards
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'AdSense', url: 'https://adsense.google.com' },
            { name: 'Adsterra', url: 'https://publishers.adsterra.com' },
            { name: 'Monatag', url: 'https://monatag.com' },
          ].map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
            >
              {p.name} Dashboard
            </a>
          ))}
        </div>
      </div>

      {/* Placement Editor Modal */}
      {placementEditorOpen && (
        <PlacementEditor
          placement={editingPlacement}
          onClose={() => { setPlacementEditorOpen(false); setEditingPlacement(null); }}
          onSave={load}
        />
      )}

      {/* Ad Editor Modal */}
      {adEditorOpen && (
        <AdEditor
          placementId={adEditorPlacementId}
          ad={editingAd}
          onClose={() => { setAdEditorOpen(false); setEditingAd(null); }}
          onSave={load}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'placement' ? 'Placement' : 'Ad'}`}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
