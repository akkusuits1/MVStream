import { useState, useEffect, useCallback } from 'react';
import {
  getWatchlist,
  addToWatchlist as addWL,
  removeFromWatchlist as removeWL,
  isInWatchlist as inWL,
  onWatchlistChange,
} from '@/services/storage';

export function useWatchlist() {
  const [ids, setIds] = useState<number[]>(getWatchlist());

  useEffect(() => {
    return onWatchlistChange(() => {
      setIds(getWatchlist());
    });
  }, []);

  const toggle = useCallback((id: number) => {
    if (inWL(id)) {
      removeWL(id);
    } else {
      addWL(id);
    }
  }, []);

  const isWatchlisted = useCallback((id: number) => {
    return ids.includes(id);
  }, [ids]);

  return { ids, toggle, isWatchlisted };
}
