// ============================================
// 404 Not Found Page
// ============================================

import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-brand-primary mb-4">404</h1>
        <p className="text-white/60 text-lg mb-2">Page Not Found</p>
        <p className="text-white/40 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
        >
          <Home size={18} /> Go Home
        </Link>
      </div>
    </div>
  );
}
