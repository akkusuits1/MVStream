import { h, $ } from '@core/utils';

export function renderHelpPage(): void {
  const main = $('#main-content');
  if (!main) return;
  main.innerHTML = '';

  const faqItems = [
    {
      q: 'How do I search for content?',
      a: 'Use the search icon in the header or navigate to the Search page. You can search by title or genre.',
    },
    {
      q: 'How do I play a movie or series?',
      a: 'Click on any movie or series card to view its details, then click the Play button to start watching.',
    },
    {
      q: 'Can I create an account?',
      a: 'Yes! You can sign in using Google authentication from the profile menu in the header.',
    },
    {
      q: 'How do I report a broken link?',
      a: 'On any content details page, look for the Report button to submit a broken link report.',
    },
    {
      q: 'Is MVStream free?',
      a: 'Yes, MVStream is completely free to use. No subscription required.',
    },
    {
      q: 'What devices are supported?',
      a: 'MVStream works on all modern browsers across desktop, tablet, and mobile devices.',
    },
  ];

  main.appendChild(
    h(
      'div',
      { class: 'legal-page container' },
      h(
        'div',
        { class: 'legal-page__header' },
        h('h1', { class: 'legal-page__title' }, 'Help Center'),
        h(
          'p',
          { class: 'legal-page__updated' },
          'Frequently asked questions and support',
        ),
      ),
      h(
        'div',
        { class: 'legal-page__content' },
        ...faqItems.map((item) =>
          h(
            'section',
            { class: 'legal-page__section legal-page__faq' },
            h('h2', { class: 'legal-page__faq-question' }, item.q),
            h('p', { class: 'legal-page__faq-answer' }, item.a),
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, 'Still need help?'),
          h(
            'p',
            {},
            "If you couldn't find what you were looking for, please reach out to us through our social channels or leave a report from the app.",
          ),
        ),
      ),
    ),
  );
}
