// ============================================
// Search Page — Search with suggestions & results
// ============================================

import { h, $ } from '@core/utils';
import { debounce } from '@core/utils';
import { searchMulti } from '@services/tmdb';
import { posterURL } from '@services/tmdb';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@services/storage';
import type { TMDBMovie, TMDBSeries } from '@types';

export async function renderSearchPage(): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  main.innerHTML = '';
  const page = h('div', { class: 'search-page animate-page-enter container' });

  // Search input
  const searchBox = h(
    'div',
    { class: 'search-page__box' },
    h(
      'div',
      { class: 'search-page__input-wrapper glass-card' },
      h('span', { class: 'search-page__icon' }, '🔍'),
      h('input', {
        class: 'search-page__input',
        type: 'search',
        placeholder: 'Search movies, series...',
        'aria-label': 'Search',
        autofocus: true,
      } as Record<string, string | boolean>),
      h(
        'button',
        {
          class: 'search-page__clear btn btn-ghost btn-icon',
          'aria-label': 'Clear search',
        },
        '✕',
      ),
    ),
  );
  page.appendChild(searchBox);

  // Recent searches
  const recent = h('div', { class: 'search-page__recent' });
  renderRecentSearches(recent);
  page.appendChild(recent);

  // Results area
  const results = h('div', { class: 'search-page__results' });
  page.appendChild(results);

  main.appendChild(page);

  // Bind search
  const input = page.querySelector('.search-page__input') as HTMLInputElement;
  const clearBtn = page.querySelector('.search-page__clear') as HTMLButtonElement;

  const doSearch = debounce(async (query: string) => {
    if (!query || query.length < 2) {
      results.innerHTML = '';
      renderRecentSearches(recent);
      return;
    }

    results.innerHTML = '';
    results.appendChild(
      h(
        'div',
        { class: 'search-page__loading' },
        h('div', { class: 'app-loader__spinner' }),
        h('p', {}, 'Searching...'),
      ),
    );

    try {
      const data = await searchMulti(query);
      results.innerHTML = '';

      const movies = data.results.filter((r) => 'title' in r && 'release_date' in r) as TMDBMovie[];
      const series = data.results.filter(
        (r) => 'name' in r && 'first_air_date' in r,
      ) as TMDBSeries[];

      if (movies.length === 0 && series.length === 0) {
        results.appendChild(
          h(
            'div',
            { class: 'empty-state' },
            h('div', { class: 'empty-state__icon' }, '🔍'),
            h('h3', { class: 'empty-state__title' }, 'No results found'),
            h('p', { class: 'empty-state__description' }, `No results for "${query}"`),
          ),
        );
        return;
      }

      // Movies section
      if (movies.length > 0) {
        results.appendChild(renderResultSection('Movies', movies, 'movie'));
      }

      // Series section
      if (series.length > 0) {
        results.appendChild(renderResultSection('Series', series, 'series'));
      }

      addSearchHistory(query);
    } catch {
      results.innerHTML = '';
      results.appendChild(
        h(
          'div',
          { class: 'empty-state' },
          h('p', { class: 'empty-state__description' }, 'Search failed. Please try again.'),
        ),
      );
    }
  }, 400);

  input?.addEventListener('input', () => doSearch(input.value));
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    results.innerHTML = '';
    renderRecentSearches(recent);
    input.focus();
  });
}

function renderRecentSearches(container: Element): void {
  container.innerHTML = '';
  const history = getSearchHistory();

  if (history.length === 0) return;

  const wrapper = h(
    'div',
    { class: 'search-page__recent-inner' },
    h(
      'div',
      { class: 'search-page__recent-header' },
      h('h3', {}, 'Recent Searches'),
      h(
        'button',
        {
          class: 'btn btn-ghost btn-sm',
          onClick: () => {
            clearSearchHistory();
            container.innerHTML = '';
          },
        },
        'Clear All',
      ),
    ),
    h(
      'div',
      { class: 'search-page__recent-chips' },
      ...history.slice(0, 10).map((q) =>
        h(
          'button',
          {
            class: 'chip',
            onClick: () => {
              const input = document.querySelector('.search-page__input') as HTMLInputElement;
              if (input) {
                input.value = q;
                input.dispatchEvent(new Event('input'));
              }
            },
          },
          q,
        ),
      ),
    ),
  );

  container.appendChild(wrapper);
}

function renderResultSection(
  title: string,
  items: (TMDBMovie | TMDBSeries)[],
  type: 'movie' | 'series',
): HTMLElement {
  const section = h(
    'div',
    { class: 'search-page__section' },
    h('h2', { class: 'search-page__section-title' }, title),
    h('div', { class: 'movie-grid' }),
  );

  const grid = section.querySelector('.movie-grid')!;

  items.slice(0, 12).forEach((item, index) => {
    const title = 'title' in item ? item.title : (item as TMDBSeries).name;
    const poster = 'poster_path' in item ? item.poster_path : null;
    const rating = item.vote_average;
    const year =
      ('release_date' in item ? item.release_date : (item as TMDBSeries).first_air_date) || '';

    const card = h(
      'a',
      {
        class: 'movie-card animate-card-enter',
        href: `#/details/${type}/${item.id}`,
        style: `--stagger-index: ${index % 20}`,
      },
      h(
        'div',
        { class: 'movie-card__poster card-3d card-shine' },
        h('img', {
          class: 'movie-card__image',
          src: posterURL(poster, 'w342'),
          alt: title,
          loading: 'lazy',
        } as Record<string, string>),
        h('div', { class: 'movie-card__rating' }, '★ ' + String(rating)),
      ),
      h(
        'div',
        { class: 'movie-card__info' },
        h('h3', { class: 'movie-card__title' }, title),
        h('p', { class: 'movie-card__meta' }, year.slice(0, 4) || 'N/A'),
      ),
    );

    grid.appendChild(card);
  });

  return section;
}
