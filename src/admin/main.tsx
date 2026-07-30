// ============================================
// Admin Panel Entry Point
// ============================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp';
import '@/index.css';

const root = createRoot(document.getElementById('admin-root')!);
root.render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
