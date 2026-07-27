import { h, $ } from '@core/utils';

export function renderAboutPage(): void {
  const main = $('#main-content');
  if (!main) return;
  main.innerHTML = '';

  main.appendChild(
    h(
      'div',
      { class: 'legal-page container' },
      h(
        'div',
        { class: 'legal-page__header' },
        h('h1', { class: 'legal-page__title' }, 'About MVStream'),
        h('p', { class: 'legal-page__updated' }, 'Your destination for movies and series'),
      ),
      h(
        'div',
        { class: 'legal-page__content' },
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'What is MVStream?'),
          h(
            'p',
            {},
            'MVStream is a free streaming platform where you can watch movies and web series online. We aggregate content from various sources to provide you with a wide selection of entertainment.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'Our Mission'),
          h(
            'p',
            {},
            'We aim to make entertainment accessible to everyone. Our platform is designed with a clean, modern interface that works seamlessly across all your devices.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'Features'),
          h(
            'p',
            {},
            'Browse thousands of movies and web series across multiple genres. Create your profile, track your watch history, and discover new content tailored to your preferences.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'Disclaimer'),
          h(
            'p',
            {},
            'MVStream does not store any files on its server. All content is provided by non-affiliated third parties. We are not responsible for the content hosted on external sources.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'Contact'),
          h('p', {}, 'Have questions or feedback? Visit our Help page for support.'),
        ),
      ),
    ),
  );
}
