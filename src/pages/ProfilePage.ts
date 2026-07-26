// ============================================
// Profile Page — User profile, watchlist, history
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';
import { getWatchlist, getWatchHistory, getContinueWatching } from '@services/storage';

export async function renderProfilePage(): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const user = stores.user.get();

  main.innerHTML = '';
  const page = h('div', { class: 'profile-page animate-page-enter container' });

  // Profile header
  page.appendChild(
    h(
      'div',
      { class: 'profile-page__header glass-card' },
      h(
        'div',
        { class: 'profile-page__avatar' },
        h(
          'div',
          { class: 'profile-page__avatar-circle' },
          h('span', {}, user?.displayName?.charAt(0)?.toUpperCase() || '👤'),
        ),
      ),
      h(
        'div',
        { class: 'profile-page__info' },
        h('h1', { class: 'profile-page__name' }, user?.displayName || 'Guest'),
        h('p', { class: 'profile-page__email' }, user?.email || 'Sign in to save your progress'),
      ),
      h(
        'div',
        { class: 'profile-page__actions' },
        h('a', { class: 'btn btn-secondary', href: '#/settings' }, '⚙️ Settings'),
      ),
    ),
  );

  // Tabs
  const tabs = h(
    'div',
    { class: 'tabs' },
    h('button', { class: 'tab tab--active', 'data-tab': 'watchlist' }, 'Watchlist'),
    h('button', { class: 'tab', 'data-tab': 'history' }, 'History'),
    h('button', { class: 'tab', 'data-tab': 'continue' }, 'Continue Watching'),
  );
  page.appendChild(tabs);

  // Tab content
  const content = h('div', { class: 'profile-page__content', id: 'profile-content' });
  page.appendChild(content);

  main.appendChild(page);

  // Default to watchlist
  renderWatchlistTab(content);

  // Tab switching
  tabs.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.tab').forEach((t) => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');

      const tabId = (tab as HTMLElement).dataset.tab;
      content.innerHTML = '';

      switch (tabId) {
        case 'watchlist':
          renderWatchlistTab(content);
          break;
        case 'history':
          renderHistoryTab(content);
          break;
        case 'continue':
          renderContinueTab(content);
          break;
      }
    });
  });
}

function renderWatchlistTab(container: Element): void {
  const items = getWatchlist();

  if (items.length === 0) {
    container.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, '🎬'),
        h('h3', { class: 'empty-state__title' }, 'No watchlist yet'),
        h('p', { class: 'empty-state__description' }, 'Add movies and series to your watchlist.'),
        h('a', { class: 'btn btn-primary', href: '#/movies' }, 'Browse Content'),
      ),
    );
    return;
  }

  const grid = h('div', { class: 'movie-grid' });
  items.forEach((item, index) => {
    const card = h(
      'a',
      {
        class: 'movie-card animate-card-enter',
        href: `#/details/${item.type}/${item.id}`,
        style: `--stagger-index: ${index % 20}`,
      },
      h(
        'div',
        { class: 'movie-card__poster card-3d card-shine' },
        h('img', {
          src: item.poster,
          alt: item.title,
          class: 'movie-card__image',
          loading: 'lazy',
        } as Record<string, string>),
      ),
      h('div', { class: 'movie-card__info' }, h('h3', { class: 'movie-card__title' }, item.title)),
    );
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderHistoryTab(container: Element): void {
  const items = getWatchHistory();

  if (items.length === 0) {
    container.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, '📜'),
        h('h3', { class: 'empty-state__title' }, 'No watch history'),
        h('p', { class: 'empty-state__description' }, 'Start watching to build your history.'),
      ),
    );
    return;
  }

  const list = h('div', { class: 'history-list' });
  items.forEach((item) => {
    list.appendChild(
      h(
        'a',
        {
          class: 'history-item',
          href: `#/details/${item.type}/${item.id}`,
        },
        h('img', {
          src: item.poster,
          alt: item.title,
          class: 'history-item__poster',
          loading: 'lazy',
        } as Record<string, string>),
        h(
          'div',
          { class: 'history-item__info' },
          h('h4', { class: 'history-item__title' }, item.title),
          h('p', { class: 'history-item__time' }, new Date(item.timestamp).toLocaleDateString()),
        ),
      ),
    );
  });

  container.appendChild(list);
}

function renderContinueTab(container: Element): void {
  const items = getContinueWatching();

  if (items.length === 0) {
    container.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, '⏩'),
        h('h3', { class: 'empty-state__title' }, 'Nothing to continue'),
        h('p', { class: 'empty-state__description' }, 'Start watching something!'),
      ),
    );
    return;
  }

  const list = h('div', { class: 'continue-list' });
  items.forEach((item) => {
    list.appendChild(
      h(
        'a',
        {
          class: 'continue-item',
          href: `#/player/${item.type}/${item.id}`,
        },
        h('img', {
          src: item.poster,
          alt: item.title,
          class: 'continue-item__poster',
          loading: 'lazy',
        } as Record<string, string>),
        h(
          'div',
          { class: 'continue-item__info' },
          h('h4', { class: 'continue-item__title' }, item.title),
          h(
            'div',
            { class: 'progress-bar' },
            h('div', {
              class: 'progress-bar__fill',
              style: `width: ${item.progress}%`,
            }),
          ),
          h('p', { class: 'continue-item__progress' }, `${item.progress}% watched`),
        ),
      ),
    );
  });

  container.appendChild(list);
}
