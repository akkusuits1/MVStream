// ============================================
// Footer — Site links & copyright
// ============================================

import { Link } from 'react-router-dom';

const linkGroups = [
  {
    title: 'Browse',
    links: [
      { to: '/movies', label: 'Movies' },
      { to: '/series', label: 'Web Series' },
      { to: '/search', label: 'Search' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'Profile' },
      { to: '/settings', label: 'Settings' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms & Conditions' },
      { to: '/disclaimer', label: 'Disclaimer' },
      { to: '/contact', label: 'Contact Us' },
      { to: '/about', label: 'About' },
      { to: '/help', label: 'Help' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Brand */}
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="text-brand-primary text-xl">&#9654;</span>
            <span className="text-white font-bold text-lg">MVStream</span>
          </Link>
          <p className="text-white/40 text-sm max-w-xs">
            Watch your favorite movies and series online for free.
          </p>
        </div>

        {/* Link Groups */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white/60 font-medium text-sm mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-white/30 text-sm mb-1">
            &copy; {new Date().getFullYear()} MVStream. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            This site does not store any files on its server. All contents are
            provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
}
