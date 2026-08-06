// ============================================
// usePageView — Track page views via Firebase
// ============================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { db } from '@/services/firebase';

export function usePageView() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const pageView = {
      path: pathname + search,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
    };

    if (db) push(ref(db, 'analytics/pageViews'), pageView).catch(() => {});
  }, [pathname, search]);
}
