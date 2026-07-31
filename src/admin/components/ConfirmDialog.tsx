// ============================================
// ConfirmDialog — Reusable confirmation modal
// ============================================

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-yellow-400'} />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand-primary hover:bg-brand-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
