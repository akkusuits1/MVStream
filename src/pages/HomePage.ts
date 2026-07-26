// ============================================
// Home Page — Hero, Sections, Continue Watching
// ============================================

import { h, $, img } from '@core/utils';
import { stores } from '@core/store';
import type { Movie, Series } from '@types';
import { tmdbImage } from '@services/tmdb';

export async function renderHomePage(): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const movies = stores.movies.get();
  const series = stores.series.get();

  main.innerHTML = '';
  main.appendChild(h('div', { class: 'home-page animate-page-enter' }));

  // Hero section
  const hero = renderHero(movies, series);
  main.firstElementChild!.appendChild(hero);

  // Continue Watching section
  // TODO: renderContinueWatching()

  // Trending section
  const trending = renderSection(
    'Trending Now',
    [...movies.slice(0, 10), ...series.slice(0, 10)] as (Movie | Series)[],
    'movie',
  );
  main.firstElementChild!.appendChild(trending);

  // Top Rated Movies
  const topMovies = renderSection(
    'Top Rated Movies',
    movies.sort((a, b) => b.rating - a.rating).slice(0, 10),
    'movie',
  );
  main.firstElementChild!.appendChild(topMovies);

  // New Series
  const newSeries = renderSection('New Web Series', series.slice(0, 10), 'series');
  main.firstElementChild!.appendChild(newSeries);

  // More sections can be added here
}

// ---- Hero Section ----
function renderHero(movies: Movie[], series: Series[]): HTMLElement {
  const allContent = [...movies, ...series] as (Movie | Series)[];
  const featured = allContent.slice(0, 5);

  if (featured.length === 0) {
    return h(
      'div',
      { class: 'hero hero--empty' },
      h(
        'div',
        { class: 'hero__content container' },
        h('h1', { class: 'hero__title' }, 'Welcome to MVStream'),
        h(
          'p',
          { class: 'hero__subtitle' },
          'Watch your favorite movies and series online for free.',
        ),
        h('a', { class: 'btn btn-primary btn-lg', href: '#/movies' }, 'Browse Movies'),
      ),
    );
  }

  const hero = h('div', { class: 'hero' });

  // Background layers
  const bg = h('div', { class: 'hero__bg' });
  for (let i = 0; i < featured.length; i++) {
    const item = featured[i];
    const slide = h('div', {
      class: `hero__slide ${i === 0 ? 'active' : ''}`,
      'data-index': String(i),
      style: `background-image: url(${tmdbImage(item.backdrop, 'original')})`,
    });
    bg.appendChild(slide);
  }
  hero.appendChild(bg);

  // Gradient overlay
  hero.appendChild(h('div', { class: 'hero__gradient' }));

  // Content
  const content = h('div', { class: 'hero__content container' });

  const firstItem = featured[0];
  const title = h('h1', { class: 'hero__title' }, firstItem.title);
  const description = h('p', { class: 'hero__description' }, firstItem.description || '');

  // Badges
  const badges = h(
    'div',
    { class: 'hero__badges' },
    h('span', { class: 'badge badge--primary' }, '★ ' + String(firstItem.rating)),
    h('span', { class: 'badge' }, String(firstItem.year)),
    h('span', { class: 'badge' }, firstItem.duration || 'Series'),
  );

  // Genre chips
  const genres = h(
    'div',
    { class: 'hero__genres' },
    ...((firstItem as Movie).genres || []).slice(0, 3).map((g) => h('span', { class: 'chip' }, g)),
  );

  // Action buttons
  const actions = h(
    'div',
    { class: 'hero__actions' },
    h(
      'a',
      {
        class: 'btn btn-primary btn-lg',
        href: `#/player/${'seasons' in firstItem ? 'series' : 'movie'}/${firstItem.id}`,
      },
      '▶ Play',
    ),
    h(
      'a',
      {
        class: 'btn btn-secondary btn-lg',
        href: `#/details/${'seasons' in firstItem ? 'series' : 'movie'}/${firstItem.id}`,
      },
      'ℹ More Info',
    ),
  );

  content.appendChild(title);
  content.appendChild(badges);
  content.appendChild(description);
  content.appendChild(genres);
  content.appendChild(actions);
  hero.appendChild(content);

  // Indicators
  if (featured.length > 1) {
    const indicators = h('div', { class: 'hero__indicators' });
    for (let i = 0; i < featured.length; i++) {
      const dot = h('button', {
        class: `hero__indicator ${i === 0 ? 'active' : ''}`,
        'data-index': String(i),
        'aria-label': `Slide ${i + 1}`,
        onClick: () => switchHeroSlide(i, featured),
      });
      indicators.appendChild(dot);
    }
    hero.appendChild(indicators);
  }

  // Auto-rotate hero
  if (featured.length > 1) {
    let current = 0;
    setInterval(() => {
      current = (current + 1) % featured.length;
      switchHeroSlide(current, featured);
    }, 6000);
  }

  return hero;
}

function switchHeroSlide(index: number, items: (Movie | Series)[]): void {
  // Update slides
  document.querySelectorAll('.hero__slide').forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  // Update indicators
  document.querySelectorAll('.hero__indicator').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // Update content
  const item = items[index];
  const titleEl = document.querySelector('.hero__title');
  const descEl = document.querySelector('.hero__description');
  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.description || '';
}

// ---- Section Row ----
function renderSection(
  title: string,
  items: (Movie | Series)[],
  defaultType: 'movie' | 'series',
): HTMLElement {
  const section = h('div', { class: 'section container' });

  const header = h(
    'div',
    { class: 'section__header' },
    h('h2', { class: 'section__title' }, title),
    h(
      'a',
      { class: 'section__link', href: `#/${defaultType === 'movie' ? 'movies' : 'series'}` },
      'See All →',
    ),
  );
  section.appendChild(header);

  const scrollRow = h('div', { class: 'scroll-row' });

  items.forEach((item, index) => {
    const isSeries = 'seasons' in item;
    const type = isSeries ? 'series' : 'movie';

    const card = h(
      'a',
      {
        class: 'movie-card animate-card-enter',
        href: `#/details/${type}/${item.id}`,
        style: `--stagger-index: ${index}`,
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
          `${item.year}${item.duration ? ' • ' + item.duration : ''}`,
        ),
      ),
    );

    scrollRow.appendChild(card);
  });

  section.appendChild(scrollRow);
  return section;
}
