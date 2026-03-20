// src/components/ui/Button.tsx
// Composant bouton réutilisable avec variants Tailwind

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className,
    disabled,
    children,
    ...props
  },
  ref
) {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-bold rounded-lg',
    'transition-all duration-200',
    'active:scale-[0.98]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    'min-h-[44px]', // Accessibilité tactile
  );

  const variantStyles = {
    primary: cn(
      'bg-primary text-on-primary',
      'hover:brightness-110',
      'disabled:bg-surface-container-highest disabled:text-on-surface-variant',
    ),
    secondary: cn(
      'bg-secondary text-on-secondary',
      'hover:brightness-110',
      'disabled:bg-surface-container-highest disabled:text-on-surface-variant',
    ),
    tertiary: cn(
      'bg-tertiary text-on-tertiary',
      'hover:brightness-110',
      'disabled:bg-surface-container-highest disabled:text-on-surface-variant',
    ),
    ghost: cn(
      'bg-transparent text-on-surface-variant',
      'hover:bg-surface-container-highest hover:text-on-surface',
      'disabled:text-on-surface-variant/30',
    ),
    danger: cn(
      'bg-error text-on-error',
      'hover:brightness-110',
      'disabled:bg-surface-container-highest disabled:text-on-surface-variant',
    ),
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Chargement…
        </span>
      ) : (
        children
      )}
    </button>
  );
});
