// ============================================
// StreamLinkManager — Manage stream links for a movie/series
// ============================================

import { useState } from 'react';
import { Link, Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import type { StreamLink } from '@/services/player';

interface StreamLinkManagerProps {
  links: StreamLink[];
  onChange: (links: StreamLink[]) => void;
}

const QUALITY_OPTIONS = ['auto', '360p', '480p', '720p', '1080p', '4K'];

export default function StreamLinkManager({ links, onChange }: StreamLinkManagerProps) {
  const [newLink, setNewLink] = useState<Partial<StreamLink>>({
    name: '',
    url: '',
    quality: 'auto',
    enabled: true,
  });

  const addLink = () => {
    if (!newLink.name?.trim() || !newLink.url?.trim()) return;
    onChange([...links, { ...newLink as StreamLink }]);
    setNewLink({ name: '', url: '', quality: 'auto', enabled: true });
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const toggleLink = (index: number) => {
    const updated = [...links];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    onChange(updated);
  };

  const updateLink = (index: number, field: keyof StreamLink, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;
    const updated = [...links];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div>
      {/* Existing Links */}
      {links.length > 0 && (
        <div className="space-y-2 mb-4">
          {links.map((link, index) => (
            <div
              key={index}
              className={`bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2 ${
                !link.enabled ? 'opacity-50' : ''
              }`}
            >
              <GripVertical size={14} className="text-white/20 shrink-0 cursor-grab" />

              {/* Name */}
              <input
                type="text"
                value={link.name}
                onChange={(e) => updateLink(index, 'name', e.target.value)}
                placeholder="Server name"
                className="w-28 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />

              {/* URL */}
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="Stream URL"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30 truncate"
              />

              {/* Quality */}
              <select
                value={link.quality}
                onChange={(e) => updateLink(index, 'quality', e.target.value)}
                className="bg-white/10 text-white text-xs px-2 py-1 rounded outline-none"
              >
                {QUALITY_OPTIONS.map((q) => (
                  <option key={q} value={q} className="bg-neutral-900">
                    {q}
                  </option>
                ))}
              </select>

              {/* Toggle */}
              <button
                onClick={() => toggleLink(index)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title={link.enabled ? 'Disable' : 'Enable'}
              >
                {link.enabled ? (
                  <Eye size={14} className="text-green-400" />
                ) : (
                  <EyeOff size={14} className="text-white/30" />
                )}
              </button>

              {/* Move up/down */}
              <div className="flex flex-col">
                <button
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                  className="text-white/20 hover:text-white text-[10px] leading-none disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveLink(index, 1)}
                  disabled={index === links.length - 1}
                  className="text-white/20 hover:text-white text-[10px] leading-none disabled:opacity-20"
                >
                  ▼
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeLink(index)}
                className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Link */}
      <div className="bg-white/5 border border-dashed border-white/10 rounded-lg p-3 flex items-center gap-2">
        <Link size={14} className="text-white/30 shrink-0" />
        <input
          type="text"
          value={newLink.name}
          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
          placeholder="Server name"
          className="w-28 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
        />
        <input
          type="text"
          value={newLink.url}
          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          placeholder="Stream URL"
          onKeyDown={(e) => e.key === 'Enter' && addLink()}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
        />
        <select
          value={newLink.quality}
          onChange={(e) => setNewLink({ ...newLink, quality: e.target.value })}
          className="bg-white/10 text-white text-xs px-2 py-1 rounded outline-none"
        >
          {QUALITY_OPTIONS.map((q) => (
            <option key={q} value={q} className="bg-neutral-900">
              {q}
            </option>
          ))}
        </select>
        <button
          onClick={addLink}
          disabled={!newLink.name?.trim() || !newLink.url?.trim()}
          className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>

      {links.length === 0 && (
        <p className="text-xs text-white/30 mt-2">No stream links added yet.</p>
      )}
    </div>
  );
}
