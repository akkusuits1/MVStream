// ============================================
// AdEditor — Add/edit individual ad units
// ============================================

import { useState, useEffect } from 'react';
import { Save, X, Code, Eye } from 'lucide-react';
import { addAdUnit, updateAdUnit } from '@/services/ads';
import type { AdUnit, AdProvider, AdType } from '@/services/ads';

interface AdEditorProps {
  placementId: string;
  ad?: AdUnit | null;
  onClose: () => void;
  onSave: () => void;
}

const PROVIDER_OPTIONS: { value: AdProvider; label: string; types: AdType[] }[] = [
  { value: 'adsense', label: 'Google AdSense', types: ['banner', 'native'] },
  { value: 'adsterra', label: 'Adsterra', types: ['banner', 'native', 'popunder', 'socialbar', 'in-page-push'] },
  { value: 'monatag', label: 'Monatag', types: ['banner', 'smartlink', 'push', 'in-page-push'] },
];

const TYPE_LABELS: Record<AdType, string> = {
  banner: 'Banner',
  native: 'Native Banner',
  popunder: 'Popunder',
  socialbar: 'Social Bar',
  smartlink: 'SmartLink',
  push: 'Push Notification',
  'in-page-push': 'In-Page Push',
};

const SIZE_OPTIONS = [
  '728x90', '320x50', '300x250', '336x280', '160x600', '300x600',
  '970x90', '970x250', '728x250', 'auto',
];

// Pre-built templates for each provider
const CODE_TEMPLATES: Record<string, string> = {
  adsense_banner: `<!-- AdSense Banner -->
<ins class="adsbygoogle"
     style="display:inline-block;width:728px;height:90px"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,

  adsense_native: `<!-- AdSense Native -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="autorelaxed"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,

  adsterra_banner: `<!-- Adsterra Banner -->
<script>
  (_adsbygoogle = _adsbygoogle || []).push({});
</script>
<!-- Replace with your Adsterra banner code -->`,

  adsterra_popunder: `<!-- Adsterra Popunder -->
<script>
  var script = document.createElement('script');
  script.async = true;
  script.src = '//www.profitabledisplaynetwork.com/YOUR_SCRIPT_ID/invoke.js';
  document.head.appendChild(script);
</script>`,

  adsterra_socialbar: `<!-- Adsterra Social Bar -->
<script>
  var script = document.createElement('script');
  script.async = true;
  script.src = '//www.profitabledisplaynetwork.com/YOUR_SCRIPT_ID/invoke.js';
  document.head.appendChild(script);
</script>`,

  monatag_smartlink: `<!-- Monatag SmartLink -->
<a href="https://YOUR_SMARTLINK_URL" target="_blank" rel="noopener noreferrer">
  <img src="https://YOUR_BANNER_IMAGE_URL" alt="Advertisement" style="max-width:100%;height:auto;" />
</a>`,

  monatag_push: `<!-- Monatag Push Notification -->
<script>
  var script = document.createElement('script');
  script.async = true;
  script.src = '//j优优推送脚本URL/invoke.js';
  document.head.appendChild(script);
</script>`,
};

export default function AdEditor({ placementId, ad, onClose, onSave }: AdEditorProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<AdProvider>('adsense');
  const [type, setType] = useState<AdType>('banner');
  const [code, setCode] = useState('');
  const [mobileCode, setMobileCode] = useState('');
  const [size, setSize] = useState('728x90');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMobileCode, setShowMobileCode] = useState(false);

  const availableTypes = PROVIDER_OPTIONS.find((p) => p.value === provider)?.types ?? [];

  useEffect(() => {
    if (ad) {
      setName(ad.name);
      setProvider(ad.provider);
      setType(ad.type);
      setCode(ad.code);
      setMobileCode(ad.mobileCode || '');
      setSize(ad.size);
      setEnabled(ad.enabled);
    }
  }, [ad]);

  // Reset type if current type not available for new provider
  useEffect(() => {
    if (!availableTypes.includes(type)) {
      setType(availableTypes[0]);
    }
  }, [provider, availableTypes, type]);

  const applyTemplate = () => {
    const key = `${provider}_${type}`;
    const template = CODE_TEMPLATES[key];
    if (template) setCode(template);
  };

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      if (ad?.id) {
        await updateAdUnit(placementId, ad.id, {
          name, provider, type, code, mobileCode, size, enabled,
        });
      } else {
        await addAdUnit(placementId, {
          name, provider, type, code, mobileCode, size, enabled,
        });
      }
      onSave();
      onClose();
    } catch (e) {
      console.error('Failed to save ad:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-neutral-900 z-10">
          <h3 className="text-lg font-semibold text-white">
            {ad ? 'Edit Ad' : 'New Ad'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Ad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homepage Leaderboard"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors placeholder:text-white/30"
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    provider === p.value
                      ? 'bg-brand-primary/10 border-brand-primary/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Ad Type</label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    type === t
                      ? 'bg-brand-primary text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Ad Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-neutral-900">{s}</option>
              ))}
            </select>
          </div>

          {/* Ad Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white/60 text-sm">Ad Code</label>
              <button
                onClick={applyTemplate}
                className="text-xs text-brand-primary hover:underline"
              >
                Insert Template
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your ad code here..."
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-white font-mono outline-none focus:border-brand-primary/50 transition-colors resize-y placeholder:text-white/30"
            />
          </div>

          {/* Mobile Code Toggle */}
          <div>
            <button
              onClick={() => setShowMobileCode(!showMobileCode)}
              className="text-xs text-brand-primary hover:underline mb-2"
            >
              {showMobileCode ? 'Hide' : 'Add'} Mobile-Specific Code
            </button>
            {showMobileCode && (
              <textarea
                value={mobileCode}
                onChange={(e) => setMobileCode(e.target.value)}
                placeholder="Optional: different code for mobile devices..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-white font-mono outline-none focus:border-brand-primary/50 transition-colors resize-y placeholder:text-white/30"
              />
            )}
          </div>

          {/* Preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
            >
              <Eye size={12} />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            {showPreview && (
              <div className="mt-2 p-4 bg-white rounded-lg border border-white/10">
                <div className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                  <Code size={12} /> Preview ({size})
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: code }}
                  className="overflow-hidden"
                />
              </div>
            )}
          </div>

          {/* Enabled Toggle */}
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
        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10 sticky bottom-0 bg-neutral-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !code.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {ad ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
