// ============================================
// Toast / Notification Component
// ============================================

import { h } from '@core/utils';
import { events, EVENTS } from '@core/events';

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function showToast(options: ToastOptions): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const { type, message, duration = 3000 } = options;

  // Clear existing toasts
  container.innerHTML = '';

  const toast = h(
    'div',
    { class: `toast toast--${type}` },
    h(
      'div',
      { class: 'toast__content' },
      h('span', { class: 'toast__icon' }, getToastIcon(type)),
      h('span', { class: 'toast__message' }, message),
    ),
    h(
      'button',
      {
        class: 'toast__close',
        'aria-label': 'Close',
        onClick: () => dismissToast(toast),
      },
      '✕',
    ),
  );

  container.appendChild(toast);

  // Auto-dismiss
  toastTimeout = setTimeout(() => {
    dismissToast(toast);
  }, duration);
}

function dismissToast(toast: HTMLElement): void {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  toast.classList.add('animate-toast-exit');
  setTimeout(() => {
    toast.remove();
  }, 300);
}

function getToastIcon(type: string): string {
  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
}

// Listen for toast events
events.on<ToastOptions>(EVENTS.UI_TOAST, showToast);
