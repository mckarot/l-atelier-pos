// src/components/ui/Toast.tsx
// Composant de notification Toast

import { cn, iconFilled } from '../../utils/cn';
import type { Toast as ToastType } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps): JSX.Element {
  const { id, message, type } = toast;

  const typeStyles = {
    success: {
      bg: 'bg-tertiary-container',
      text: 'text-tertiary',
      icon: 'check_circle',
    },
    error: {
      bg: 'bg-error-container',
      text: 'text-error',
      icon: 'error',
    },
    warning: {
      bg: 'bg-primary-container',
      text: 'text-primary',
      icon: 'warning',
    },
    info: {
      bg: 'bg-surface-container-highest',
      text: 'text-on-surface',
      icon: 'info',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'animate-[slideIn_0.3s_ease-out]',
        style.bg,
        'min-w-[300px] max-w-md'
      )}
      role="alert"
      aria-live="polite"
    >
      <span
        className={cn(iconFilled(), style.text)}
        aria-hidden="true"
      >
        {style.icon}
      </span>
      <span className={cn('font-medium flex-1', style.text)}>
        {message}
      </span>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          'p-1 rounded hover:bg-black/10 transition-colors',
          style.text
        )}
        aria-label="Fermer la notification"
      >
        <span
          className="material-symbols-outlined text-sm"
          aria-hidden="true"
        >
          close
        </span>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element | null {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
