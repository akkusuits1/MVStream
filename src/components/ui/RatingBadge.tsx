// ============================================
// RatingBadge — Star rating display
// ============================================

import { Star } from 'lucide-react';
import { getRatingColor, formatRating } from '@/lib/utils';

export default function RatingBadge({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span
      className="flex items-center gap-1 text-xs font-medium"
      style={{ color: getRatingColor(rating) }}
    >
      <Star size={size} fill="currentColor" />
      {formatRating(rating)}
    </span>
  );
}
