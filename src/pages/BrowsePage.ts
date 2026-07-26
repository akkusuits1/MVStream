// ============================================
// Browse Page — Movies/Series Grid with Filters
// ============================================

import { h, $, img, tmdbImage } from '@core/utils';
import { stores } from '@core/store';
import type { Movie } from '@types';

export async function renderBrowsePage(params: Record<string, string>): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const type = params.type || 'movies';
  const items = type === 'movies' ? stores.movies.get() : stores.series.get();

  main.innerHTML = '';
  const page = h('div', { class: 'browse-page animate-page-enter container' });

  // Page header
  page.appendChild(
    h(
      'div',
      { class: 'browse-page__header' },
      h('h1', { class: 'browse-page__title' }, type === 'movies' ? 'Movies' : 'Web Series'),
      h(
        'p',
        { class: 'browse-page__subtitle' },
        `${items.length} ${type === 'movies' ? 'movies' : 'series'} available`,
      ),
    ),
  );

  // Filter bar
  const filterBar = renderFilterBar(type);
  page.appendChild(filterBar);

  // Grid
  const grid = h('div', { class: 'movie-grid browse-page__grid' });

  items.forEach((item, index) => {
    const isSeries = 'seasons' in item;
    const contentType = isSeries ? 'series' : 'movie';

    const card = h(
      'a',
      {
        class: 'movie-card animate-card-enter',
        href: `#/details/${contentType}/${item.id}`,
        style: `--stagger-index: ${index % 20}`,
      },
      h(
        'div',
        { class: 'movie-card__poster card-3d card-shine' },
        img(tmdbImage(item.poster, 'w342'), item.title, 'movie-card__image'),
        h('div', { class: 'movie-card__rating' }, '★ ' + String(item.rating)),
        isSeries ? h('span', { class: 'movie-card__type-badge' }, 'Series') : null,
      ),
      h(
        'div',
        { class: 'movie-card__info' },
        h('h3', { class: 'movie-card__title' }, item.title),
        h(
          'p',
          { class: 'movie-card__meta' },
          `${item.year}${(item as Movie).duration ? ' • ' + (item as Movie).duration : ''}`,
        ),
      ),
    );

    grid.appendChild(card);
  });

  if (items.length === 0) {
    grid.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, type === 'movies' ? '🎬' : '📺'),
        h('h3', { class: 'empty-state__title' }, `No ${type} found`),
        h('p', { class: 'empty-state__description' }, 'Check back later for new content.'),
      ),
    );
  }

  page.appendChild(grid);
  main.appendChild(page);
}

function renderFilterBar(_type: string): HTMLElement {
  const categories = stores.categories.get();
  const bar = h('div', { class: 'filter-bar glass' });

  // Genre chips
  const genreChips = h('div', { class: 'filter-bar__genres' });
  genreChips.appendChild(
    h(
      'button',
      {
        class: 'chip chip--active',
        'data-filter': 'all',
        onClick: (e) => handleFilterClick(e, 'genre'),
      },
      'All',
    ),
  );

  for (const cat of categories) {
    genreChips.appendChild(
      h(
        'button',
        {
          class: 'chip',
          'data-filter': cat.slug,
          onClick: (e) => handleFilterClick(e, 'genre'),
        },
        cat.name,
      ),
    );
  }
  bar.appendChild(genreChips);

  // Sort dropdown
  const sortContainer = h(
    'div',
    { class: 'filter-bar__sort' },
    h('label', { class: 'filter-bar__sort-label' }, 'Sort by: '),
    h(
      'select',
      {
        class: 'input filter-bar__sort-select',
        onChange: (e) => {
          const select = e.target as HTMLSelectElement;
          // TODO: implement sorting
          console.warn('Sort:', select.value);
        },
      },
      h('option', { value: 'popular' }, 'Most Popular'),
      h('option', { value: 'rating' }, 'Highest Rated'),
      h('option', { value: 'year-desc' }, 'Newest First'),
      h('option', { value: 'year-asc' }, 'Oldest First'),
      h('option', { value: 'title' }, 'A-Z'),
    ),
  );
  bar.appendChild(sortContainer);

  return bar;
}

function handleFilterClick(e: Event, filterType: string): void {
  const target = e.target as HTMLElement;
  const group = target.parentElement;

  // Deactivate siblings
  group?.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.remove('chip--active');
  });
  target.classList.add('chip--active');

  // TODO: filter grid items
  console.warn(`${filterType} filter:`, target.dataset.filter);
}
