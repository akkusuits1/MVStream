// ============================================
// Footer Component
// ============================================

import { h } from '@core/utils';

export function renderFooter(container: Element): void {
  const footer = h('footer', { class: 'footer safe-bottom' });

  const inner = h('div', { class: 'footer__inner container' });

  // Logo & description
  const brand = h('div', { class: 'footer__brand' },
    h('a', { class: 'footer__logo', href: '#/' },
      h('span', { class: 'header__logo-icon' }, '▶'),
      h('span', { class: 'header__logo-text' }, 'MVStream')
    ),
    h('p', { class: 'footer__description' }, 'Watch your favorite movies and series online for free.')
  );
  inner.appendChild(brand);

  // Links grid
  const links = h('div', { class: 'footer__links' });

  const linkGroups = [
    {
      title: 'Browse',
      items: [
        { href: '#/movies', label: 'Movies' },
        { href: '#/series', label: 'Web Series' },
        { href: '#/search', label: 'Search' },
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '#/profile', label: 'Profile' },
        { href: '#/settings', label: 'Settings' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { href: '#/privacy', label: 'Privacy Policy' },
        { href: '#/about', label: 'About' },
        { href: '#/help', label: 'Help' },
      ],
    },
  ];

  for (const group of linkGroups) {
    const groupEl = h('div', { class: 'footer__link-group' },
      h('h4', { class: 'footer__link-group-title' }, group.title),
      ...group.items.map((item) =>
        h('a', { class: 'footer__link', href: item.href }, item.label)
      )
    );
    links.appendChild(groupEl);
  }
  inner.appendChild(links);

  // Copyright
  const copyright = h('div', { class: 'footer__bottom' },
    h('p', { class: 'footer__copyright' }, `© ${new Date().getFullYear()} MVStream. All rights reserved.`),
    h('p', { class: 'footer__disclaimer' },
      'This site does not store any files on its server. All contents are provided by non-affiliated third parties.'
    )
  );
  inner.appendChild(copyright);

  footer.appendChild(inner);
  container.appendChild(footer);
}