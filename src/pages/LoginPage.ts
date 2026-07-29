// ============================================
// Login Page — Google Sign-In Only
// ============================================

import { h, $ } from '@core/utils';
import { stores } from '@core/store';

export function renderLoginPage(): void {
  const main = $('#main-content');
  if (!main) return;

  // If already logged in, redirect to home
  if (stores.user.get()) {
    window.location.hash = '#/';
    return;
  }

  main.innerHTML = '';

  const page = h('div', { class: 'auth-page animate-page-enter' });
  const container = h('div', { class: 'auth-page__container' });

  // Card
  const card = h('div', { class: 'auth-page__card glass-card' });

  // Logo
  card.appendChild(
    h(
      'div',
      { class: 'auth-page__logo' },
      h('span', { class: 'auth-page__logo-icon' }, '\u25B6'),
      h('span', { class: 'auth-page__logo-text' }, 'MVStream'),
    ),
  );

  // Title
  card.appendChild(h('h1', { class: 'auth-page__title' }, 'Welcome'));
  card.appendChild(
    h('p', { class: 'auth-page__subtitle' }, 'Sign in to continue watching'),
  );

  // Error message
  const errorEl = h('div', { class: 'auth-page__error', style: 'display: none;' });
  card.appendChild(errorEl);

  // Google Sign-In button
  const googleBtn = h(
    'button',
    {
      class: 'btn btn-primary btn-lg auth-page__submit auth-page__google-btn',
      type: 'button',
    },
    'G',
    ' Sign in with Google',
  );
  card.appendChild(googleBtn);

  // Loading spinner
  const spinner = h('div', { class: 'auth-page__spinner', style: 'display: none;' });
  spinner.appendChild(h('div', { class: 'app-loader__spinner' }));
  card.appendChild(spinner);

  // Handle Google sign-in
  googleBtn.addEventListener('click', async () => {
    errorEl.style.display = 'none';
    googleBtn.style.display = 'none';
    spinner.style.display = 'flex';

    try {
      const { signInWithGoogle } = await import('@services/auth');
      await signInWithGoogle();

      // Redirect
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const redirect = urlParams.get('redirect') || '#/';
      window.location.hash = redirect;
    } catch (err: unknown) {
      const authError = err as { message?: string; code?: string };
      showError(authError.message || getAuthErrorMessage(authError.code || 'unknown'));
    } finally {
      googleBtn.style.display = 'flex';
      spinner.style.display = 'none';
    }
  });

  function showError(msg: string): void {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  container.appendChild(card);
  page.appendChild(container);
  main.appendChild(page);
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup blocked. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'Something went wrong. Please try again';
  }
}
