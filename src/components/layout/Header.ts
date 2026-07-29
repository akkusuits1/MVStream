// ============================================
// Header Component — Navigation & Logo
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';

export function renderHeader(container: Element): void {
  const header = h('header', { class: 'header glass-strong safe-top' });

  // Inner container
  const inner = h('div', { class: 'header__inner container' });

  // Logo
  const logo = h(
    'a',
    {
      class: 'header__logo',
      href: '#/',
    },
    h('span', { class: 'header__logo-icon' }, '▶'),
    h('span', { class: 'header__logo-text' }, 'MVStream'),
  );
  inner.appendChild(logo);

  // Desktop Navigation
  const nav = h('nav', { class: 'header__nav hide-sm', 'aria-label': 'Main navigation' });
  const navLinks = [
    { href: '#/', label: 'Home', page: 'home' },
    { href: '#/movies', label: 'Movies', page: 'movies' },
    { href: '#/series', label: 'Series', page: 'series' },
  ];

  for (const link of navLinks) {
    const a = h(
      'a',
      {
        class: 'header__nav-link',
        href: link.href,
        'data-page': link.page,
      },
      link.label,
    );
    nav.appendChild(a);
  }
  inner.appendChild(nav);

  // Right side: Search, Profile
  const actions = h('div', { class: 'header__actions' });

  // Theme toggle
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const themeIcon = h('i', {
    class: currentTheme === 'dark' ? 'icon-moon' : 'icon-sun',
  });
  const themeBtn = h(
    'button',
    {
      class: 'btn btn-ghost btn-icon header__theme-btn',
      'aria-label': 'Toggle theme',
      onClick: () => {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('mvstream-theme', newTheme);
        themeIcon.className = isDark ? 'icon-sun' : 'icon-moon';
      },
    },
    themeIcon,
  );
  actions.appendChild(themeBtn);

  // Search button
  const searchBtn = h(
    'button',
    {
      class: 'btn btn-ghost btn-icon header__search-btn',
      'aria-label': 'Search',
      onClick: () => {
        window.location.hash = '#/search';
      },
    },
    h('i', { class: 'icon-search' }),
  );
  actions.appendChild(searchBtn);

  // Sign In button (shown when not logged in)
  const signInBtn = h(
    'a',
    {
      class: 'btn btn-primary btn-sm header__signin-btn',
      href: '#/login',
    },
    'Sign In',
  );
  actions.appendChild(signInBtn);

  // Profile dropdown (shown when logged in)
  const profileBtn = h(
    'button',
    {
      class: 'header__profile-btn',
      'aria-label': 'Profile menu',
      onClick: () => toggleProfileMenu(),
    },
    h('div', { class: 'header__avatar' }, h('i', { class: 'icon-user' })),
  );
  actions.appendChild(profileBtn);

  // Mobile menu toggle
  const menuBtn = h(
    'button',
    {
      class: 'btn btn-ghost btn-icon header__menu-btn show-sm',
      'aria-label': 'Menu',
      onClick: () => toggleMobileMenu(),
    },
    h('i', { class: 'icon-menu' }),
  );
  actions.appendChild(menuBtn);

  inner.appendChild(actions);
  header.appendChild(inner);

  // Profile dropdown menu
  const profileMenu = h(
    'div',
    { class: 'header__dropdown' },
    h(
      'a',
      { class: 'header__dropdown-item', href: '#/profile' },
      h('i', { class: 'icon-user' }),
      ' Profile',
    ),
    h(
      'a',
      { class: 'header__dropdown-item', href: '#/settings' },
      h('i', { class: 'icon-settings' }),
      ' Settings',
    ),
    h('div', { class: 'divider' }),
    h(
      'button',
      {
        class: 'header__dropdown-item header__dropdown-item--danger',
        onClick: async () => {
          const { logout } = await import('@services/auth');
          await logout();
          window.location.hash = '#/';
        },
      },
      h('i', { class: 'icon-log-out' }),
      ' Logout',
    ),
  );
  profileBtn.appendChild(profileMenu);

  // Mobile menu
  const mobileMenu = h('div', { class: 'header__mobile-menu glass-strong' });
  // Nav links
  for (const link of navLinks) {
    mobileMenu.appendChild(
      h(
        'a',
        {
          class: 'header__mobile-menu-link',
          href: link.href,
          onClick: () => closeMobileMenu(),
        },
        link.label,
      ),
    );
  }
  mobileMenu.appendChild(h('div', { class: 'divider' }));
  // Auth-aware mobile menu items
  const mobileSignIn = h(
    'a',
    { class: 'header__mobile-menu-link', href: '#/login', onClick: () => closeMobileMenu() },
    '\uD83D\uDD11 Sign In',
  );
  const mobileProfile = h(
    'a',
    { class: 'header__mobile-menu-link', href: '#/profile', onClick: () => closeMobileMenu() },
    '\uD83D\uDC64 Profile',
  );
  const mobileSettings = h(
    'a',
    { class: 'header__mobile-menu-link', href: '#/settings', onClick: () => closeMobileMenu() },
    '\u2699\uFE0F Settings',
  );
  mobileMenu.appendChild(mobileSignIn);
  mobileMenu.appendChild(mobileProfile);
  mobileMenu.appendChild(mobileSettings);
  header.appendChild(mobileMenu);

  container.appendChild(header);

  // Update active nav link
  stores.activePage.subscribe((page) => {
    header.querySelectorAll('.header__nav-link').forEach((link) => {
      const el = link as HTMLElement;
      el.classList.toggle('active', el.dataset.page === page);
    });
  });

  // Auth-reactive: show sign-in button or profile based on login state
  function updateAuthUI(user: unknown): void {
    const isLoggedIn = !!user;
    signInBtn.style.display = isLoggedIn ? 'none' : '';
    profileBtn.style.display = isLoggedIn ? '' : 'none';
    mobileSignIn.style.display = isLoggedIn ? 'none' : '';
    mobileProfile.style.display = isLoggedIn ? '' : 'none';
    mobileSettings.style.display = isLoggedIn ? '' : 'none';
  }
  updateAuthUI(stores.user.get());
  stores.user.subscribe((user) => updateAuthUI(user));

  // Handle scroll for header styling
  window.addEventListener(
    'scroll',
    () => {
      const currentScroll = window.scrollY;
      header.classList.toggle('header--scrolled', currentScroll > 50);
    },
    { passive: true },
  );
}

function toggleProfileMenu(): void {
  const menu = $('.header__dropdown');
  if (menu) {
    menu.classList.toggle('open');
    // Close on outside click
    const close = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.classList.remove('open');
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}

function toggleMobileMenu(): void {
  const menu = $('.header__mobile-menu');
  if (menu) {
    menu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  }
}

function closeMobileMenu(): void {
  const menu = $('.header__mobile-menu');
  if (menu) {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
}
