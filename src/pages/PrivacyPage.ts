import { h, $ } from '@core/utils';

export function renderPrivacyPage(): void {
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
        h('h1', { class: 'legal-page__title' }, 'Privacy Policy'),
        h(
          'p',
          { class: 'legal-page__updated' },
          'Last updated: January 1, 2024',
        ),
      ),
      h(
        'div',
        { class: 'legal-page__content' },
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '1. Information We Collect'),
          h(
            'p',
            {},
            'We collect information you provide directly, such as your account details (name, email), and usage data including pages visited, search queries, and content interactions.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '2. How We Use Your Information'),
          h(
            'p',
            {},
            'We use the information to provide and improve our services, personalize your experience, communicate with you, and ensure the security of our platform.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '3. Cookies and Tracking'),
          h(
            'p',
            {},
            'We use cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookies through your browser settings.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '4. Data Sharing'),
          h(
            'p',
            {},
            'We do not sell your personal information. We may share data with service providers who assist in operating our platform, and as required by law.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '5. Data Security'),
          h(
            'p',
            {},
            'We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '6. Your Rights'),
          h(
            'p',
            {},
            'You have the right to access, correct, or delete your personal data. Contact us to exercise these rights.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '7. Changes to This Policy'),
          h(
            'p',
            {},
            'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.',
          ),
        ),
        h(
          'section',
          { class: 'legal-page__section' },
          h('h2', {}, '8. Contact Us'),
          h(
            'p',
            {},
            'If you have questions about this Privacy Policy, please contact us through our Help page.',
          ),
        ),
      ),
    ),
  );
}
