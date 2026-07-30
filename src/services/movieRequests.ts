import { ref, push, get, remove, update } from 'firebase/database';
import { db } from './firebase';

export interface MovieRequest {
  id?: string;
  tmdbId: number;
  type: 'movie' | 'series';
  title: string;
  posterPath: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

const REQUESTS_PATH = 'movieRequests';

export async function requestMovie(data: Omit<MovieRequest, 'status' | 'createdAt'>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const requestsRef = ref(db, REQUESTS_PATH);
  await push(requestsRef, {
    ...data,
    status: 'pending',
    createdAt: Date.now(),
  });
}

export async function getMovieRequests(): Promise<MovieRequest[]> {
  if (!db) return [];
  const requestsRef = ref(db, REQUESTS_PATH);
  const snapshot = await get(requestsRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, val]) => ({
    id,
    ...(val as Omit<MovieRequest, 'id'>),
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
  await update(requestRef, { status });
}

export async function deleteRequest(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
  await remove(requestRef);
}
