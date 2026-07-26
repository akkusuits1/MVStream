// ============================================
// Details Page — Movie/Series detail view
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';
import { tmdbImage } from '@core/utils';
import type { Movie, Series } from '@types';

export async function renderDetailsPage(params: Record<string, string>): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const { type, id } = params;

  main.innerHTML = '';
  main.appendChild(
    h(
      'div',
      { class: 'details-page animate-page-enter' },
      h('div', { class: 'app-loader__spinner' }),
      h('p', { style: 'text-align: center; color: var(--text-muted);' }, 'Loading...'),
    ),
  );

  // Find content
  let item: Movie | Series | undefined;
  if (type === 'movie') {
    item = stores.movies.get().find((m) => m.id === id);
  } else {
    item = stores.series.get().find((s) => s.id === id);
  }

  if (!item) {
    main.innerHTML = '';
    main.appendChild(
      h(
        'div',
        { class: 'empty-state' },
        h('div', { class: 'empty-state__icon' }, '🔍'),
        h('h2', { class: 'empty-state__title' }, 'Not Found'),
        h('p', { class: 'empty-state__description' }, 'This content could not be found.'),
        h('a', { class: 'btn btn-primary', href: '#/' }, 'Go Home'),
      ),
    );
    return;
  }

  const isSeries = 'seasons' in item;
  const series = item as Series;
  const movie = item as Movie;

  main.innerHTML = '';

  // Hero banner
  const hero = h(
    'div',
    { class: 'details-hero' },
    h('div', {
      class: 'details-hero__bg',
      style: `background-image: url(${tmdbImage(item.backdrop, 'original')})`,
    }),
    h('div', { class: 'details-hero__gradient' }),
    h(
      'div',
      { class: 'details-hero__content container' },
      h(
        'div',
        { class: 'details-hero__poster' },
        h('img', {
          src: tmdbImage(item.poster, 'w500'),
          alt: item.title,
          class: 'details-hero__poster-img card-3d',
        } as Record<string, string>),
      ),
      h(
        'div',
        { class: 'details-hero__info' },
        h('h1', { class: 'details-hero__title' }, item.title),
        h(
          'div',
          { class: 'details-hero__meta' },
          h('span', { class: 'badge badge--primary' }, '★ ' + String(item.rating)),
          h('span', { class: 'details-hero__year' }, String(item.year)),
          isSeries
            ? h(
                'span',
                { class: 'details-hero__duration' },
                `${series.seasons?.length || 0} Season${(series.seasons?.length || 0) !== 1 ? 's' : ''}`,
              )
            : h('span', { class: 'details-hero__duration' }, movie.duration),
          isSeries
            ? h(
                'span',
                {
                  class: `badge ${series.status === 'ongoing' ? 'badge--success' : 'badge--warning'}`,
                },
                series.status === 'ongoing' ? 'Ongoing' : 'Completed',
              )
            : null,
        ),
        h(
          'div',
          { class: 'details-hero__genres' },
          ...item.genres.slice(0, 5).map((g) => h('span', { class: 'chip' }, g)),
        ),
        h(
          'div',
          { class: 'details-hero__actions' },
          h(
            'a',
            {
              class: 'btn btn-primary btn-lg',
              href: `#/player/${type}/${item.id}`,
            },
            '▶ Play Now',
          ),
          h(
            'button',
            {
              class: 'btn btn-secondary btn-lg',
              onClick: () => {
                // TODO: toggle watchlist
              },
            },
            '🤍 Watchlist',
          ),
          item.trailer
            ? h(
                'a',
                {
                  class: 'btn btn-ghost btn-lg',
                  href: `https://www.youtube.com/watch?v=${item.trailer}`,
                  target: '_blank',
                },
                '▶ Trailer',
              )
            : null,
        ),
        h(
          'div',
          { class: 'details-hero__description' },
          h('p', {}, item.description || 'No description available.'),
        ),
        // Cast & crew
        item.cast && item.cast.length > 0
          ? h(
              'div',
              { class: 'details-hero__cast' },
              h('h3', {}, 'Cast'),
              h('p', {}, item.cast.slice(0, 5).join(', ')),
            )
          : null,
        'director' in item && movie.director
          ? h(
              'div',
              { class: 'details-hero__crew' },
              h('h3', {}, 'Director'),
              h('p', {}, movie.director),
            )
          : null,
      ),
    ),
  );
  main.appendChild(hero);

  // Seasons & Episodes (for series)
  if (isSeries && series.seasons && series.seasons.length > 0) {
    const seasonsSection = h(
      'div',
      { class: 'details-section container' },
      h('h2', { class: 'section__title' }, 'Seasons & Episodes'),
    );

    for (const season of series.seasons) {
      const seasonBlock = h(
        'div',
        { class: 'season-block glass-card' },
        h(
          'div',
          { class: 'season-block__header' },
          h(
            'h3',
            { class: 'season-block__title' },
            season.title || `Season ${season.seasonNumber}`,
          ),
          h('span', { class: 'season-block__count' }, `${season.episodes?.length || 0} episodes`),
        ),
      );

      if (season.episodes && season.episodes.length > 0) {
        const episodeList = h('div', { class: 'episode-list' });

        for (const ep of season.episodes) {
          const epCard = h(
            'a',
            {
              class: 'episode-card',
              href: `#/player/series/${item.id}?season=${season.id}&episode=${ep.id}`,
            },
            h('div', { class: 'episode-card__number' }, String(ep.episodeNumber)),
            h(
              'div',
              { class: 'episode-card__info' },
              h('h4', { class: 'episode-card__title' }, ep.title || `Episode ${ep.episodeNumber}`),
              h('p', { class: 'episode-card__duration' }, ep.duration || ''),
            ),
          );
          episodeList.appendChild(epCard);
        }

        seasonBlock.appendChild(episodeList);
      }

      seasonsSection.appendChild(seasonBlock);
    }

    main.appendChild(seasonsSection);
  }

  // Related content
  // TODO: render related content section
}
