// ============================================
// MVStream Admin Panel — Entry Point
// ============================================

import '../styles/globals.css';
import { initAuth, isAdmin } from '@services/auth';
import { stores } from '@core/store';
import { $, h } from '@core/utils';
import { fetchMovies, fetchSeries, fetchCategories } from '@utils/helpers';

// ---- Admin State ----
const adminState = {
  activeTab: 'dashboard',
  movies: [] as unknown[],
  series: [] as unknown[],
  categories: [] as { id: string; name: string }[],
  initialized: false,
};

// ---- Initialize Admin ----
async function initAdmin(): Promise<void> {
  const app = $('#admin-app');
  if (!app) return;

  // Init auth
  initAuth();

  // Wait for auth to resolve
  await new Promise<void>((resolve) => {
    const unsub = stores.authLoading.subscribe((loading) => {
      if (!loading) {
        unsub();
        resolve();
      }
    });
  });

  // Check admin
  if (!isAdmin()) {
    renderLoginRequired(app);
    return;
  }

  // Load data
  try {
    const [movies, series, categories] = await Promise.all([
      fetchMovies(),
      fetchSeries(),
      fetchCategories(),
    ]);

    adminState.movies = movies;
    adminState.series = series;
    adminState.categories = categories;
    adminState.initialized = true;

    stores.movies.set(movies);
    stores.series.set(series);
    stores.categories.set(categories);

    renderAdmin(app);
  } catch (error) {
    console.error('Admin init failed:', error);
    renderError(app);
  }
}

// ---- Render Login Required ----
function renderLoginRequired(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'admin-login-required' },
      h(
        'div',
        { class: 'admin-login-required__card glass-card' },
        h('h1', {}, '🔒 Admin Access Required'),
        h(
          'p',
          { style: 'color: var(--text-secondary); margin: 16px 0;' },
          'Please log in with an admin account.',
        ),
        h(
          'a',
          {
            class: 'btn btn-primary btn-lg',
            href: '/MVStream/#/login',
          },
          'Go to Login',
        ),
      ),
    ),
  );
}

// ---- Render Error ----
function renderError(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'admin-login-required' },
      h(
        'div',
        { class: 'admin-login-required__card glass-card' },
        h('h1', {}, '⚠️ Error'),
        h(
          'p',
          { style: 'color: var(--text-secondary); margin: 16px 0;' },
          'Failed to load admin panel.',
        ),
        h(
          'button',
          {
            class: 'btn btn-primary',
            onClick: () => window.location.reload(),
          },
          'Retry',
        ),
      ),
    ),
  );
}

// ---- Render Admin Shell ----
function renderAdmin(container: Element): void {
  container.innerHTML = '';

  const layout = h('div', { class: 'admin-layout' });

  // Sidebar
  const sidebar = h('aside', { class: 'admin-sidebar glass-strong' });
  const sidebarHeader = h(
    'div',
    { class: 'admin-sidebar__header' },
    h('h2', { class: 'admin-sidebar__logo' }, 'MVStream'),
    h('span', { class: 'admin-sidebar__badge badge badge--primary' }, 'Admin'),
  );
  sidebar.appendChild(sidebarHeader);

  const nav = h('nav', { class: 'admin-sidebar__nav' });
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'movies', icon: '🎬', label: 'Movies' },
    { id: 'series', icon: '📺', label: 'Series' },
    { id: 'categories', icon: '📁', label: 'Categories' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'reports', icon: '📋', label: 'Reports' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  for (const item of navItems) {
    const link = h(
      'button',
      {
        class: `admin-sidebar__link ${item.id === 'dashboard' ? 'active' : ''}`,
        'data-tab': item.id,
        onClick: () => switchTab(item.id),
      },
      h('span', { class: 'admin-sidebar__icon' }, item.icon),
      h('span', { class: 'admin-sidebar__label' }, item.label),
    );
    nav.appendChild(link);
  }
  sidebar.appendChild(nav);

  // Logout button
  const logoutBtn = h(
    'button',
    {
      class: 'admin-sidebar__link admin-sidebar__logout',
      onClick: async () => {
        const { logout } = await import('@services/auth');
        await logout();
        window.location.reload();
      },
    },
    h('span', { class: 'admin-sidebar__icon' }, '🚪'),
    h('span', { class: 'admin-sidebar__label' }, 'Logout'),
  );
  sidebar.appendChild(logoutBtn);

  layout.appendChild(sidebar);

  // Main content
  const main = h(
    'main',
    { class: 'admin-main' },
    h(
      'div',
      { class: 'admin-main__header' },
      h('h1', { class: 'admin-main__title' }, 'Dashboard'),
      h(
        'div',
        { class: 'admin-main__header-actions' },
        h('a', { class: 'btn btn-secondary btn-sm', href: '#/' }, '← Back to Site'),
      ),
    ),
    h('div', { class: 'admin-main__content', id: 'admin-content' }),
  );
  layout.appendChild(main);

  container.appendChild(layout);

  // Render default tab
  switchTab('dashboard');
}

// ---- Tab Switching ----
function switchTab(tabId: string): void {
  adminState.activeTab = tabId;

  // Update nav active state
  document.querySelectorAll('.admin-sidebar__link').forEach((link) => {
    link.classList.toggle('active', (link as HTMLElement).dataset.tab === tabId);
  });

  // Update title
  const titleEl = $('.admin-main__title');
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    movies: 'Movies',
    series: 'Series',
    categories: 'Categories',
    users: 'Users',
    reports: 'Reports',
    settings: 'Settings',
  };
  if (titleEl) titleEl.textContent = titles[tabId] || tabId;

  // Render tab content
  const content = $('#admin-content');
  if (!content) return;

  switch (tabId) {
    case 'dashboard':
      renderDashboard(content);
      break;
    case 'movies':
      renderMovies(content);
      break;
    case 'series':
      renderSeries(content);
      break;
    case 'categories':
      renderCategories(content);
      break;
    case 'users':
      renderUsers(content);
      break;
    case 'reports':
      renderReports(content);
      break;
    case 'settings':
      renderSettings(content);
      break;
  }
}

// ---- Dashboard ----
function renderDashboard(container: Element): void {
  container.innerHTML = '';

  const statsGrid = h('div', { class: 'admin-stats-grid' });

  const stats = [
    { label: 'Total Movies', value: adminState.movies.length, icon: '🎬', color: '#E50914' },
    { label: 'Total Series', value: adminState.series.length, icon: '📺', color: '#FF6B35' },
    { label: 'Categories', value: adminState.categories.length, icon: '📁', color: '#00D4AA' },
    { label: 'Reports', value: 0, icon: '📋', color: '#FFB800' },
  ];

  for (const stat of stats) {
    const card = h(
      'div',
      { class: 'admin-stat-card glass-card animate-card-enter' },
      h('div', { class: 'admin-stat-card__icon', style: `color: ${stat.color}` }, stat.icon),
      h(
        'div',
        { class: 'admin-stat-card__info' },
        h('div', { class: 'admin-stat-card__value' }, String(stat.value)),
        h('div', { class: 'admin-stat-card__label' }, stat.label),
      ),
    );
    statsGrid.appendChild(card);
  }

  container.appendChild(statsGrid);

  // Chart placeholder
  const chartContainer = h(
    'div',
    { class: 'admin-chart-container glass-card' },
    h('h3', { style: 'margin-bottom: 16px;' }, 'Views Over Time'),
    h('canvas', { id: 'viewsChart', width: '800', height: '300' }),
  );
  container.appendChild(chartContainer);
}

// ---- Content List (shared for movies/series) ----
function renderContentList(container: Element, items: unknown[], type: 'movies' | 'series'): void {
  container.innerHTML = '';

  const header = h(
    'div',
    { class: 'admin-content-header' },
    h('button', { class: 'btn btn-primary' }, `+ Add ${type === 'movies' ? 'Movie' : 'Series'}`),
  );
  container.appendChild(header);

  if (items.length === 0) {
    container.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, type === 'movies' ? '🎬' : '📺'),
        h('h3', { class: 'empty-state__title' }, `No ${type} yet`),
        h(
          'p',
          { class: 'empty-state__description' },
          `Add your first ${type.slice(0, -1)} to get started.`,
        ),
      ),
    );
    return;
  }

  const table = h('div', { class: 'admin-table glass-card' });
  const thead = h(
    'div',
    { class: 'admin-table__header' },
    h('div', { class: 'admin-table__cell admin-table__cell--title' }, 'Title'),
    h('div', { class: 'admin-table__cell' }, 'Year'),
    h('div', { class: 'admin-table__cell' }, 'Rating'),
    h('div', { class: 'admin-table__cell' }, 'Actions'),
  );
  table.appendChild(thead);

  for (const item of items as Record<string, unknown>[]) {
    const row = h(
      'div',
      { class: 'admin-table__row' },
      h(
        'div',
        { class: 'admin-table__cell admin-table__cell--title' },
        h('div', { class: 'admin-table__title' }, String(item.title || 'Untitled')),
      ),
      h('div', { class: 'admin-table__cell' }, String(item.year || 'N/A')),
      h('div', { class: 'admin-table__cell' }, `${item.rating || 0} ⭐`),
      h(
        'div',
        { class: 'admin-table__cell admin-table__cell--actions' },
        h('button', { class: 'btn btn-ghost btn-sm' }, 'Edit'),
        h(
          'button',
          { class: 'btn btn-ghost btn-sm', style: 'color: var(--status-error);' },
          'Delete',
        ),
      ),
    );
    table.appendChild(row);
  }

  container.appendChild(table);
}

function renderMovies(container: Element): void {
  renderContentList(container, adminState.movies, 'movies');
}

function renderSeries(container: Element): void {
  renderContentList(container, adminState.series, 'series');
}

function renderCategories(container: Element): void {
  container.innerHTML = '';

  const header = h(
    'div',
    { class: 'admin-content-header' },
    h('button', { class: 'btn btn-primary' }, '+ Add Category'),
  );
  container.appendChild(header);

  if (adminState.categories.length === 0) {
    container.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, '📁'),
        h('h3', { class: 'empty-state__title' }, 'No categories yet'),
      ),
    );
    return;
  }

  const list = h('div', { class: 'admin-categories-list' });
  for (const cat of adminState.categories) {
    const item = h(
      'div',
      { class: 'admin-category-item glass-card' },
      h('span', { class: 'admin-category-item__name' }, cat.name),
      h(
        'div',
        { class: 'admin-category-item__actions' },
        h('button', { class: 'btn btn-ghost btn-sm' }, 'Edit'),
        h(
          'button',
          { class: 'btn btn-ghost btn-sm', style: 'color: var(--status-error);' },
          'Delete',
        ),
      ),
    );
    list.appendChild(item);
  }
  container.appendChild(list);
}

function renderUsers(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__icon' }, '👥'),
      h('h3', { class: 'empty-state__title' }, 'User Management'),
      h('p', { class: 'empty-state__description' }, 'Coming soon'),
    ),
  );
}

function renderReports(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__icon' }, '📋'),
      h('h3', { class: 'empty-state__title' }, 'Reports'),
      h('p', { class: 'empty-state__description' }, 'No pending reports'),
    ),
  );
}

function renderSettings(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__icon' }, '⚙️'),
      h('h3', { class: 'empty-state__title' }, 'Settings'),
      h('p', { class: 'empty-state__description' }, 'Coming soon'),
    ),
  );
}

// ---- Bootstrap ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
