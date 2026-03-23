// src/components/ui/DatePicker.tsx
// Input date natif avec style Atelier POS

import { type JSX, useId, type RefObject } from 'react';
import { cn } from '../../utils/cn';

export interface DatePickerProps {
  /** Valeur sélectionnée (format YYYY-MM-DD) */
  value: string;
  /** Callback de changement */
  onChange: (value: string) => void;
  /** Date minimum (format YYYY-MM-DD) */
  minDate?: string;
  /** Date maximum (format YYYY-MM-DD) */
  maxDate?: string;
  /** Label du champ */
  label?: string;
  /** État d'erreur */
  error?: string;
  /** Désactivé */
  disabled?: boolean;
  /** Classe CSS supplémentaire */
  className?: string;
  /** Ref pour l'input (pour focus management) */
  inputRef?: RefObject<HTMLInputElement>;
}

/**
 * DatePicker natif avec style personnalisé
 * - Type="date"
 * - Min date = today par défaut
 * - Background : bg-surface-container-high
 * - Label : text-[10px] uppercase tracking-widest
 */
export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  label = 'Date',
  error,
  disabled = false,
  className,
  inputRef,
}: DatePickerProps): JSX.Element {
  const id = useId();
  const inputId = `date-picker-${id}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={inputId}
        className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
      >
        {label}
      </label>

      <input
        ref={inputRef}
        type="date"
        id={inputId}
        value={value}
        min={minDate}
        max={maxDate}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg bg-surface-container-high px-4 py-3 text-on-surface',
          'placeholder:text-on-surface-variant',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          error && 'ring-1 ring-error focus-visible:outline-error'
        )}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default DatePicker;
