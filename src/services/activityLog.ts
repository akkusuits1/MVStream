// ============================================
// Activity Log — Track admin actions in Firebase
// ============================================

import { ref, push, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from './firebase';

export interface ActivityEntry {
  id?: string;
  action: string;
  target: string;
  details?: string;
  adminUid: string;
  adminName: string;
  timestamp: number;
}

const LOG_PATH = 'activityLog';

export async function logActivity(data: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
  if (!db) return;
  const logRef = ref(db, LOG_PATH);
  await push(logRef, {
    ...data,
    timestamp: Date.now(),
  });
}

export async function getActivityLog(limit = 50): Promise<ActivityEntry[]> {
  if (!db) return [];
  const logRef = ref(db, LOG_PATH);
  const q = query(logRef, orderByChild('timestamp'), limitToLast(limit));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...(val as Omit<ActivityEntry, 'id'>) }))
    .sort((a, b) => b.timestamp - a.timestamp);
}
