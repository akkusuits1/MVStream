// ============================================
// MVStream — App Entry Point
// ============================================

import './styles/globals.css';
import { createRouter } from '@core/router';
import { initAuth } from '@services/auth';
import { stores } from '@core/store';
import { $, h } from '@core/utils';
import type { Movie, Series } from '@types';

// ---- Services ----
import { fetchMovies, fetchSeries, fetchCategories, fetchSettings } from '@utils/helpers';

// ---- Components ----
import { renderHeader } from '@components/layout/Header';
import { renderFooter } from '@components/layout/Footer';

// ---- Pages (lazy-loaded) ----
let renderHomePage: (() => Promise<void>) | null = null;
let renderBrowsePage: ((params: Record<string, string>) => Promise<void>) | null = null;
let renderSearchPage: (() => Promise<void>) | null = null;
let renderDetailsPage: ((params: Record<string, string>) => Promise<void>) | null = null;
let renderPlayerPage: ((params: Record<string, string>) => Promise<void>) | null = null;
let renderProfilePage: (() => Promise<void>) | null = null;
let renderSettingsPage: (() => Promise<void>) | null = null;
let renderPrivacyPage: (() => void | Promise<void>) | null = null;
let renderAboutPage: (() => void | Promise<void>) | null = null;
let renderHelpPage: (() => void | Promise<void>) | null = null;

// ---- App State ----
const appState = {
  movies: [] as Movie[],
  series: [] as Series[],
  categories: [] as { id: string; name: string; slug: string }[],
  loaded: false,
};

// ---- Initialize App ----
async function initApp(): Promise<void> {
  const app = $('#app');
  if (!app) return;

  try {
    // Load settings first (to check maintenance mode)
    const settings = await fetchSettings();
    if (settings?.maintenanceMode) {
      renderMaintenance(app, (settings.maintenanceMessage as string) || 'Under maintenance');
      return;
    }

    // Initialize auth
    initAuth();

    // Load data
    const [movies, series, categories] = await Promise.all([
      fetchMovies(),
      fetchSeries(),
      fetchCategories(),
    ]);

    appState.movies = movies;
    appState.series = series;
    appState.categories = categories;
    appState.loaded = true;

    // Update stores
    stores.movies.set(movies);
    stores.series.set(series);
    stores.categories.set(categories);

    // Render shell
    renderShell(app);

    // Setup router
    setupRouter();
  } catch (error) {
    console.error('App initialization failed:', error);
    renderError(app);
  }
}

// ---- Render Maintenance Page ----
function renderMaintenance(container: Element, message: string): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'maintenance-page' },
      h(
        'div',
        { class: 'maintenance-page__content' },
        h('div', { class: 'maintenance-page__icon' }, '🔧'),
        h('h1', { class: 'maintenance-page__title' }, 'Under Maintenance'),
        h('p', { class: 'maintenance-page__message' }, message),
        h('p', { class: 'maintenance-page__hint' }, "We'll be back soon!"),
      ),
    ),
  );
}

// ---- Render Error Page ----
function renderError(container: Element): void {
  container.innerHTML = '';
  container.appendChild(
    h(
      'div',
      { class: 'error-page' },
      h(
        'div',
        { class: 'error-page__content' },
        h('div', { class: 'error-page__icon' }, '⚠️'),
        h('h1', { class: 'error-page__title' }, 'Something went wrong'),
        h(
          'p',
          { class: 'error-page__message' },
          'Failed to load the application. Please try again.',
        ),
        h(
          'button',
          {
            class: 'btn btn-primary btn-lg',
            onClick: () => window.location.reload(),
          },
          'Retry',
        ),
      ),
    ),
  );
}

// ---- Render App Shell ----
function renderShell(container: Element): void {
  container.innerHTML = '';

  // Skip link (a11y)
  container.appendChild(
    h('a', { class: 'skip-to-content', href: '#main-content' }, 'Skip to content'),
  );

  // Header
  renderHeader(container);

  // Main content area
  const main = h('main', {
    id: 'main-content',
    class: 'main-content',
  });
  container.appendChild(main);

  // Footer
  renderFooter(container);

  // Toast container
  const toastContainer = h('div', { class: 'toast-container', id: 'toast-container' });
  container.appendChild(toastContainer);
}

// ---- Router Setup ----
function setupRouter(): void {
  const router = createRouter({
    onRouteChange: (path) => {
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update active page in store
      const page = path.split('/')[1] || 'home';
      stores.activePage.set(page);
    },
    onNotFound: () => {
      renderNotFound();
    },
  });

  // Routes
  router.on('/', async () => {
    await loadPageModule('home');
    renderHomePage?.();
  });

  router.on('/movies', async () => {
    await loadPageModule('browse');
    renderBrowsePage?.({ type: 'movies' });
  });

  router.on('/series', async () => {
    await loadPageModule('browse');
    renderBrowsePage?.({ type: 'series' });
  });

  router.on('/search', async () => {
    await loadPageModule('search');
    renderSearchPage?.();
  });

  router.on('/details/:type/:id', async (params) => {
    await loadPageModule('details');
    renderDetailsPage?.(params);
  });

  router.on('/player/:type/:id', async (params) => {
    await loadPageModule('player');
    renderPlayerPage?.(params);
  });

  router.on('/profile', async () => {
    await loadPageModule('profile');
    renderProfilePage?.();
  });

  router.on('/settings', async () => {
    await loadPageModule('settings');
    renderSettingsPage?.();
  });

  router.on('/privacy', async () => {
    await loadPageModule('privacy');
    renderPrivacyPage?.();
  });

  router.on('/about', async () => {
    await loadPageModule('about');
    renderAboutPage?.();
  });

  router.on('/help', async () => {
    await loadPageModule('help');
    renderHelpPage?.();
  });

  // Fallback for unknown routes
  router.on('/(.*)', () => {
    const main = $('#main-content');
    if (main) {
      main.innerHTML = '';
      main.appendChild(
        h('div', { class: 'error-page' },
          h('div', { class: 'error-page__inner' },
            h('div', { class: 'error-page__icon' }, '404'),
            h('h1', { class: 'error-page__title' }, 'Page Not Found'),
            h('p', { class: 'error-page__message' }, 'The page you\'re looking for doesn\'t exist.'),
            h('a', { href: '#/', class: 'btn btn-primary' }, 'Back to Home'),
          ),
        ),
      );
    }
  });

  router.start();
}

// ---- Lazy Page Loaders ----
async function loadPageModule(page: string): Promise<void> {
  switch (page) {
    case 'home':
      if (!renderHomePage) {
        const mod = await import('@pages/HomePage');
        renderHomePage = mod.renderHomePage;
      }
      break;
    case 'browse':
      if (!renderBrowsePage) {
        const mod = await import('@pages/BrowsePage');
        renderBrowsePage = mod.renderBrowsePage;
      }
      break;
    case 'search':
      if (!renderSearchPage) {
        const mod = await import('@pages/SearchPage');
        renderSearchPage = mod.renderSearchPage;
      }
      break;
    case 'details':
      if (!renderDetailsPage) {
        const mod = await import('@pages/DetailsPage');
        renderDetailsPage = mod.renderDetailsPage;
      }
      break;
    case 'player':
      if (!renderPlayerPage) {
        const mod = await import('@pages/PlayerPage');
        renderPlayerPage = mod.renderPlayerPage;
      }
      break;
    case 'profile':
      if (!renderProfilePage) {
        const mod = await import('@pages/ProfilePage');
        renderProfilePage = mod.renderProfilePage;
      }
      break;
    case 'settings':
      if (!renderSettingsPage) {
        const mod = await import('@pages/SettingsPage');
        renderSettingsPage = mod.renderSettingsPage;
      }
      break;
    case 'privacy':
      if (!renderPrivacyPage) {
        const mod = await import('@pages/PrivacyPage');
        renderPrivacyPage = mod.renderPrivacyPage;
      }
      break;
    case 'about':
      if (!renderAboutPage) {
        const mod = await import('@pages/AboutPage');
        renderAboutPage = mod.renderAboutPage;
      }
      break;
    case 'help':
      if (!renderHelpPage) {
        const mod = await import('@pages/HelpPage');
        renderHelpPage = mod.renderHelpPage;
      }
      break;
  }
}

function renderNotFound(): void {
  const main = $('#main-content');
  if (!main) return;
  main.innerHTML = '';
  main.appendChild(
    h(
      'div',
      { class: 'empty-state' },
      h('div', { class: 'empty-state__icon' }, '🔍'),
      h('h2', { class: 'empty-state__title' }, 'Page Not Found'),
      h('p', { class: 'empty-state__description' }, "The page you're looking for doesn't exist."),
      h('a', { class: 'btn btn-primary', href: '#/' }, 'Go Home'),
    ),
  );
}

// ---- Bootstrap ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
