// ============================================
// PlacementEditor — Add/edit ad placement zones
// ============================================

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { addPlacement, updatePlacement } from '@/services/ads';
import type { AdPlacement, PlacementPosition } from '@/services/ads';

interface PlacementEditorProps {
  placement?: AdPlacement | null;
  onClose: () => void;
  onSave: () => void;
}

const POSITION_OPTIONS: { value: PlacementPosition; label: string; description: string }[] = [
  { value: 'header', label: 'Header Banner', description: 'Below the navigation bar' },
  { value: 'sidebar', label: 'Sidebar', description: 'Right side of content pages' },
  { value: 'in-content', label: 'In-Content', description: 'Between content rows' },
  { value: 'footer', label: 'Footer Banner', description: 'Above the footer' },
  { value: 'popup', label: 'Popunder', description: 'Triggered on first click' },
  { value: 'interstitial', label: 'Interstitial', description: 'Between page navigations' },
];

export default function PlacementEditor({ placement, onClose, onSave }: PlacementEditorProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<PlacementPosition>('header');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (placement) {
      setName(placement.name);
      setPosition(placement.position);
      setEnabled(placement.enabled);
    }
  }, [placement]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (placement?.id) {
        await updatePlacement(placement.id, { name, position, enabled });
      } else {
        await addPlacement({ name, position, enabled });
      }
      onSave();
      onClose();
    } catch (e) {
      console.error('Failed to save placement:', e);
      setError(e instanceof Error ? e.message : 'Failed to save. Check Firebase configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {placement ? 'Edit Placement' : 'New Placement'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Placement Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homepage Top Banner"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-1.5">Position</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPosition(opt.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    position === opt.value
                      ? 'bg-brand-primary/10 border-brand-primary/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white/60 text-sm">Enabled</label>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? 'bg-brand-primary' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                enabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {placement ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
