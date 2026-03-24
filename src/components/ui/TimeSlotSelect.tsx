// src/components/ui/TimeSlotSelect.tsx
// Select de créneaux horaires 30min avec groupes Midi et Soir

import { type JSX, useId } from 'react';
import { cn } from '../../utils/cn';
import type { TimeSlot } from '../../firebase/types';

export interface TimeSlotSelectProps {
  /** Valeur sélectionnée */
  value: string;
  /** Callback de changement */
  onChange: (value: string) => void;
  /** Label du champ */
  label?: string;
  /** État d'erreur */
  error?: string;
  /** Désactivé */
  disabled?: boolean;
  /** Classe CSS supplémentaire */
  className?: string;
}

/** Créneaux horaires groupés par service */
const TIME_SLOTS = {
  midi: {
    label: 'Service Midi',
    slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] as TimeSlot[],
  },
  soir: {
    label: 'Service Soir',
    slots: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'] as TimeSlot[],
  },
};

/**
 * Select de créneaux horaires avec groupement par service
 * - Groupes : Midi (12:00-14:30) et Soir (19:00-22:00)
 * - Background : bg-surface-container-high
 * - Options : créneaux 30min
 */
export function TimeSlotSelect({
  value,
  onChange,
  label = 'Heure',
  error,
  disabled = false,
  className,
}: TimeSlotSelectProps): JSX.Element {
  const id = useId();
  const selectId = `time-slot-${id}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={selectId}
        className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
      >
        {label}
      </label>

      <select
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg bg-surface-container-high px-4 py-3 text-on-surface',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          error && 'ring-1 ring-error focus-visible:outline-error'
        )}
      >
        <option value="">Sélectionner un créneau</option>

        <optgroup label={TIME_SLOTS.midi.label}>
          {TIME_SLOTS.midi.slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </optgroup>

        <optgroup label={TIME_SLOTS.soir.label}>
          {TIME_SLOTS.soir.slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </optgroup>
      </select>

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

export default TimeSlotSelect;
