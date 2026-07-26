// ============================================
// Mobile Bottom Navigation Bar
// ============================================

import { h } from '@core/utils';
import { stores } from '@core/store';

export function renderMobileNav(container: Element): void {
  const nav = h('nav', {
    class: 'mobile-nav glass-strong safe-bottom',
    'aria-label': 'Mobile navigation',
  });

  const links = [
    { href: '#/', icon: '🏠', label: 'Home', page: 'home' },
    { href: '#/movies', icon: '🎬', label: 'Movies', page: 'movies' },
    { href: '#/series', icon: '📺', label: 'Series', page: 'series' },
    { href: '#/search', icon: '🔍', label: 'Search', page: 'search' },
    { href: '#/profile', icon: '👤', label: 'Profile', page: 'profile' },
  ];

  for (const link of links) {
    const a = h(
      'a',
      {
        class: 'mobile-nav__item',
        href: link.href,
        'data-page': link.page,
        'aria-label': link.label,
      },
      h('span', { class: 'mobile-nav__icon' }, link.icon),
      h('span', { class: 'mobile-nav__label' }, link.label),
    );
    nav.appendChild(a);
  }

  container.appendChild(nav);

  // Update active state
  stores.activePage.subscribe((page) => {
    nav.querySelectorAll('.mobile-nav__item').forEach((item) => {
      const el = item as HTMLElement;
      el.classList.toggle('active', el.dataset.page === page);
    });
  });
}
