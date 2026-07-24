// ============================================
// Settings Page — User preferences
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';
import { getPlayerSettings, setPlayerSettings, clearAllUserData } from '@services/storage';

export async function renderSettingsPage(): Promise<void> {
  const main = $('#main-content');
  if (!main) return;

  const user = stores.user.get();
  const playerSettings = getPlayerSettings();

  main.innerHTML = '';
  const page = h('div', { class: 'settings-page animate-page-enter container' });

  page.appendChild(h('h1', { class: 'settings-page__title' }, 'Settings'));

  // Account section
  page.appendChild(
    h('section', { class: 'settings-section glass-card' },
      h('h2', { class: 'settings-section__title' }, 'Account'),
      h('div', { class: 'settings-section__content' },
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Email'),
            h('p', { class: 'settings-item__value' }, user?.email || 'Not signed in')
          )
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Display Name'),
            h('p', { class: 'settings-item__value' }, user?.displayName || 'User')
          ),
          h('button', { class: 'btn btn-secondary btn-sm' }, 'Edit')
        )
      )
    )
  );

  // Playback section
  page.appendChild(
    h('section', { class: 'settings-section glass-card' },
      h('h2', { class: 'settings-section__title' }, 'Playback'),
      h('div', { class: 'settings-section__content' },
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Auto-play next episode'),
            h('p', { class: 'settings-item__description' }, 'Automatically play the next episode')
          ),
          h('label', { class: 'toggle' },
            h('input', {
              type: 'checkbox',
              class: 'toggle__input',
              checked: playerSettings.autoPlay,
              onChange: (e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                setPlayerSettings({ autoPlay: checked });
              },
            } as Record<string, string | boolean | ((e: Event) => void)>),
            h('span', { class: 'toggle__slider' })
          )
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Default Quality'),
            h('p', { class: 'settings-item__description' }, 'Video playback quality preference')
          ),
          h('select', {
            class: 'input settings-item__select',
            onChange: (e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              setPlayerSettings({ defaultQuality: value as 'auto' | '1080' | '720' | '480' });
            },
          },
            h('option', { value: 'auto', selected: playerSettings.defaultQuality === 'auto' }, 'Auto'),
            h('option', { value: '1080', selected: playerSettings.defaultQuality === '1080' }, '1080p'),
            h('option', { value: '720', selected: playerSettings.defaultQuality === '720' }, '720p'),
            h('option', { value: '480', selected: playerSettings.defaultQuality === '480' }, '480p')
          )
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'External Player'),
            h('p', { class: 'settings-item__description' }, 'Open videos in external player by default')
          ),
          h('label', { class: 'toggle' },
            h('input', {
              type: 'checkbox',
              class: 'toggle__input',
              checked: playerSettings.externalPlayer,
              onChange: (e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                setPlayerSettings({ externalPlayer: checked });
              },
            } as Record<string, string | boolean | ((e: Event) => void)>),
            h('span', { class: 'toggle__slider' })
          )
        )
      )
    )
  );

  // Data section
  page.appendChild(
    h('section', { class: 'settings-section glass-card' },
      h('h2', { class: 'settings-section__title' }, 'Data'),
      h('div', { class: 'settings-section__content' },
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Clear Watch History'),
            h('p', { class: 'settings-item__description' }, 'Remove all items from your watch history')
          ),
          h('button', {
            class: 'btn btn-secondary btn-sm',
            onClick: () => {
              if (confirm('Clear all watch history?')) {
                const { clearWatchHistory } = require('@services/storage');
                clearWatchHistory();
                // TODO: show toast
              }
            },
          }, 'Clear')
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Clear All Data'),
            h('p', { class: 'settings-item__description' }, 'Remove all locally stored data')
          ),
          h('button', {
            class: 'btn btn-secondary btn-sm',
            style: 'color: var(--status-error); border-color: var(--status-error);',
            onClick: () => {
              if (confirm('This will clear all your local data. Continue?')) {
                clearAllUserData();
                // TODO: show toast
              }
            },
          }, 'Clear All')
        )
      )
    )
  );

  // About section
  page.appendChild(
    h('section', { class: 'settings-section glass-card' },
      h('h2', { class: 'settings-section__title' }, 'About'),
      h('div', { class: 'settings-section__content' },
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Version'),
            h('p', { class: 'settings-item__value' }, 'MVStream v2.0.0')
          )
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Privacy Policy'),
          ),
          h('a', { class: 'btn btn-ghost btn-sm', href: '#/privacy' }, 'View →')
        ),
        h('div', { class: 'settings-item' },
          h('div', { class: 'settings-item__info' },
            h('label', { class: 'settings-item__label' }, 'Help'),
          ),
          h('a', { class: 'btn btn-ghost btn-sm', href: '#/help' }, 'View →')
        )
      )
    )
  );

  main.appendChild(page);
}