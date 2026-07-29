// ============================================
// Login / Register Page
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

  let isLogin = true;

  const page = h('div', { class: 'auth-page animate-page-enter' });
  const container = h('div', { class: 'auth-page__container' });

  // Card
  const card = h('div', { class: 'auth-page__card glass-card' });

  // Logo
  const logo = h(
    'div',
    { class: 'auth-page__logo' },
    h('span', { class: 'auth-page__logo-icon' }, '\u25B6'),
    h('span', { class: 'auth-page__logo-text' }, 'MVStream'),
  );
  card.appendChild(logo);

  // Title
  const title = h('h1', { class: 'auth-page__title' }, 'Welcome Back');
  card.appendChild(title);

  const subtitle = h('p', { class: 'auth-page__subtitle' }, 'Sign in to continue watching');
  card.appendChild(subtitle);

  // Error message
  const errorEl = h('div', { class: 'auth-page__error', style: 'display: none;' });
  card.appendChild(errorEl);

  // Form
  const form = h('form', { class: 'auth-page__form' });

  // Display name field (register only)
  const nameGroup = h('div', { class: 'auth-page__field', style: 'display: none;' });
  const nameInput = h('input', {
    class: 'input',
    type: 'text',
    placeholder: 'Display Name',
    'aria-label': 'Display Name',
    autocomplete: 'name',
  }) as HTMLInputElement;
  nameGroup.appendChild(nameInput);

  // Email field
  const emailGroup = h('div', { class: 'auth-page__field' });
  const emailInput = h('input', {
    class: 'input',
    type: 'email',
    placeholder: 'Email',
    'aria-label': 'Email',
    autocomplete: 'email',
    required: '',
  }) as HTMLInputElement;
  emailGroup.appendChild(emailInput);

  // Password field
  const pwGroup = h('div', { class: 'auth-page__field' });
  const pwInput = h('input', {
    class: 'input',
    type: 'password',
    placeholder: 'Password',
    'aria-label': 'Password',
    autocomplete: 'current-password',
    required: '',
  }) as HTMLInputElement;
  pwGroup.appendChild(pwInput);

  // Submit button
  const submitBtn = h(
    'button',
    { class: 'btn btn-primary btn-lg auth-page__submit', type: 'submit' },
    'Sign In',
  );

  // Loading spinner
  const spinner = h('div', { class: 'auth-page__spinner', style: 'display: none;' });
  spinner.appendChild(h('div', { class: 'app-loader__spinner' }));

  form.appendChild(nameGroup);
  form.appendChild(emailGroup);
  form.appendChild(pwGroup);
  form.appendChild(submitBtn);
  form.appendChild(spinner);

  // Forgot password link (login only)
  const forgotLink = h(
    'a',
    {
      class: 'auth-page__forgot',
      href: '#',
      onClick: (e: Event) => {
        e.preventDefault();
        handleForgotPassword(emailInput.value, errorEl);
      },
    },
    'Forgot password?',
  );

  // Toggle login/register
  const toggleText = h('div', { class: 'auth-page__toggle' });
  const toggleLink = h(
    'a',
    {
      class: 'auth-page__toggle-link',
      href: '#',
      onClick: (e: Event) => {
        e.preventDefault();
        isLogin = !isLogin;
        updateForm();
      },
    },
    'Create an account',
  );
  toggleText.appendChild(document.createTextNode("Don't have an account? "));
  toggleText.appendChild(toggleLink);

  card.appendChild(form);
  card.appendChild(forgotLink);
  card.appendChild(toggleText);
  container.appendChild(card);
  page.appendChild(container);
  main.appendChild(page);

  // Update form state
  function updateForm(): void {
    title.textContent = isLogin ? 'Welcome Back' : 'Create Account';
    subtitle.textContent = isLogin ? 'Sign in to continue watching' : 'Sign up to get started';
    submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
    nameGroup.style.display = isLogin ? 'none' : 'block';
    toggleLink.textContent = isLogin ? 'Create an account' : 'Sign in instead';
    toggleText.childNodes[0].textContent = isLogin
      ? "Don't have an account? "
      : 'Already have an account? ';
    forgotLink.style.display = isLogin ? 'block' : 'none';
    errorEl.style.display = 'none';
    pwInput.placeholder = isLogin ? 'Password' : 'Create password';
    pwInput.autocomplete = isLogin ? 'current-password' : 'new-password';
  }

  // Form submit
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const email = emailInput.value.trim();
    const password = pwInput.value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (!isLogin && password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    // Show loading
    submitBtn.style.display = 'none';
    spinner.style.display = 'flex';

    try {
      const { login, register } = await import('@services/auth');

      if (isLogin) {
        await login(email, password);
      } else {
        const displayName = nameInput.value.trim() || email.split('@')[0];
        await register(email, password, displayName);
      }

      // Redirect
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const redirect = urlParams.get('redirect') || '#/';
      window.location.hash = redirect;
    } catch (err: unknown) {
      const authError = err as { message?: string; code?: string };
      showError(authError.message || getAuthErrorMessage(authError.code || 'unknown'));
    } finally {
      submitBtn.style.display = 'block';
      spinner.style.display = 'none';
    }
  });

  function showError(msg: string): void {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    default:
      return 'Something went wrong. Please try again';
  }
}

async function handleForgotPassword(email: string, errorEl: HTMLElement): Promise<void> {
  if (!email) {
    errorEl.textContent = 'Enter your email first, then click Forgot password';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const { resetPassword } = await import('@services/auth');
    await resetPassword(email);
    errorEl.textContent = 'Password reset email sent! Check your inbox.';
    errorEl.style.color = 'var(--status-success)';
    errorEl.style.display = 'block';
  } catch {
    errorEl.textContent = 'Failed to send reset email. Check your email address.';
    errorEl.style.color = '';
    errorEl.style.display = 'block';
  }
}
