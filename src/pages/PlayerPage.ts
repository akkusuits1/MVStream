// ============================================
// Player Page — Video Player with server selection
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';
import type { Movie, Series, ServerLink } from '@types';

export async function renderPlayerPage(params: Record<string, string>): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const { type, id } = params;
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const seasonId = urlParams.get('season');
  const episodeId = urlParams.get('episode');

  main.innerHTML = '';
  main.appendChild(
    h(
      'div',
      { class: 'player-page animate-page-enter' },
      h(
        'div',
        { class: 'player-page__wrapper container' },

        // Back button
        h(
          'div',
          { class: 'player-page__nav' },
          h(
            'a',
            {
              class: 'btn btn-ghost',
              href: `#/details/${type}/${id}`,
            },
            '← Back to Details',
          ),
        ),

        // Player container
        h(
          'div',
          { class: 'player-page__player glass-card' },
          h(
            'div',
            { id: 'player-container', class: 'player-page__video' },
            h('div', { class: 'app-loader__spinner', style: 'margin: 100px auto;' }),
            h('p', { style: 'text-align: center; color: var(--text-muted);' }, 'Loading player...'),
          ),
        ),

        // Server selection
        h(
          'div',
          { class: 'player-page__controls glass' },
          h(
            'div',
            { class: 'player-page__servers' },
            h('span', { class: 'player-page__servers-label' }, 'Server:'),
            h('div', { class: 'player-page__server-list', id: 'server-list' }),
          ),
          h(
            'div',
            { class: 'player-page__external' },
            h(
              'button',
              {
                class: 'btn btn-secondary btn-sm',
                onClick: () => openExternalPlayer('vlc'),
              },
              '📺 VLC',
            ),
            h(
              'button',
              {
                class: 'btn btn-secondary btn-sm',
                onClick: () => openExternalPlayer('mx'),
              },
              '📱 MX Player',
            ),
          ),
        ),

        // Video info
        h('div', { class: 'player-page__info glass-card', id: 'player-info' }),
      ),
    ),
  );

  // Load content and set up servers
  loadContent(type, id, seasonId, episodeId);
}

function loadContent(
  type: string,
  id: string,
  seasonId: string | null,
  episodeId: string | null,
): void {
  const infoEl = $('#player-info');
  const serverListEl = $('#server-list');
  if (!infoEl || !serverListEl) return;

  let item: Movie | Series | undefined;
  let servers: ServerLink[] = [];

  if (type === 'movie') {
    item = stores.movies.get().find((m) => m.id === id);
    if (item) {
      servers = (item as Movie).servers || [];
      infoEl.innerHTML = '';
      infoEl.appendChild(
        h(
          'div',
          {},
          h('h2', {}, item.title),
          h(
            'p',
            { style: 'color: var(--text-secondary);' },
            `${item.year} • ${item.genres?.join(', ')}`,
          ),
        ),
      );
    }
  } else {
    item = stores.series.get().find((s) => s.id === id);
    if (item) {
      const series = item as Series;
      // Find the specific season/episode
      const season = series.seasons?.find((s) => s.id === seasonId);
      const episode = season?.episodes?.find((e) => e.id === episodeId);
      servers = episode?.servers || [];

      if (episode) {
        infoEl.innerHTML = '';
        infoEl.appendChild(
          h(
            'div',
            {},
            h('h2', {}, `${series.title} — S${season?.seasonNumber || 1}E${episode.episodeNumber}`),
            h('p', {}, episode.title || ''),
            h('p', { style: 'color: var(--text-secondary);' }, episode.description || ''),
          ),
        );
      }
    }
  }

  // Render servers
  serverListEl.innerHTML = '';
  if (servers.length === 0) {
    serverListEl.appendChild(
      h('p', { style: 'color: var(--text-muted);' }, 'No servers available'),
    );
  } else {
    servers.forEach((server, index) => {
      const btn = h(
        'button',
        {
          class: `btn ${index === 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`,
          onClick: () => selectServer(server),
        },
        server.name + (server.quality ? ` (${server.quality})` : ''),
      );
      serverListEl.appendChild(btn);
    });

    // Auto-select first server
    if (servers[0]) {
      selectServer(servers[0]);
    }
  }
}

function selectServer(server: ServerLink): void {
  console.log('Selected server:', server);
  // TODO: initialize Plyr with server URL
  // const player = initPlayer('#player-container');
  // loadVideo(player, server.url);
}

function openExternalPlayer(player: 'vlc' | 'mx'): void {
  console.log('Open in external player:', player);
  // TODO: implement external player launch
}
