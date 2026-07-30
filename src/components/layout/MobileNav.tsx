// ============================================
// Mobile Bottom Navigation Bar
// ============================================

import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Search, User } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/movies', icon: Film, label: 'Movies' },
  { to: '/series', icon: Tv, label: 'Series' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-colors ${
                active ? 'text-brand-primary' : 'text-white/40'
              }`}
              aria-label={link.label}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
