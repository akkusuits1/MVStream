// ============================================
// LoadingSpinner — Centered loading indicator
// ============================================

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      {text && <p className="text-white/40 text-sm">{text}</p>}
    </div>
  );
}
