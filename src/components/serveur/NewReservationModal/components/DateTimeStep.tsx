// src/components/serveur/NewReservationModal/components/DateTimeStep.tsx
// Étape 1 : Date, Heure et Nombre de couverts

import { type JSX, useId, useEffect, useRef } from 'react';
import { DatePicker } from '../../../ui/DatePicker';
import { TimeSlotSelect } from '../../../ui/TimeSlotSelect';

export interface DateTimeStepProps {
  /** Date sélectionnée (YYYY-MM-DD) */
  date: string;
  /** Heure sélectionnée (HH:MM) */
  time: string;
  /** Nombre de couverts */
  guests: number;
  /** Callback de mise à jour */
  onChange: (data: { date?: string; time?: string; guests?: number }) => void;
  /** Erreurs de validation */
  errors: Record<string, string>;
}

/**
 * Étape 1 du formulaire de réservation
 * - DatePicker (date >= today)
 * - TimeSlotSelect (créneaux 30min)
 * - GuestsSelect (1-10 personnes)
 * - Validation : date, time, guests obligatoires
 */
export function DateTimeStep({
  date,
  time,
  guests,
  onChange,
  errors,
}: DateTimeStepProps): JSX.Element {
  const id = useId();
  const guestsInputId = `guests-${id}`;
  const guestsErrorId = `${guestsInputId}-error`;

  // Refs for focus management
  const dateInputRef = useRef<HTMLInputElement>(null);
  const guestsInputRef = useRef<HTMLInputElement>(null);

  // Initialiser la date minimum à aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  // Gestionnaires de changement
  const handleDateChange = (newDate: string) => {
    onChange({ date: newDate });
  };

  const handleTimeChange = (newTime: string) => {
    onChange({ time: newTime });
  };

  const handleGuestsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    onChange({ guests: isNaN(value) ? 1 : value });
  };

  // Focus sur le premier champ en erreur
  useEffect(() => {
    if (errors.date) {
      dateInputRef.current?.focus();
    } else if (errors.guests) {
      guestsInputRef.current?.focus();
    }
  }, [errors]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          value={date}
          onChange={handleDateChange}
          minDate={today}
          label="Date"
          error={errors.date}
          inputRef={dateInputRef}
        />

        <TimeSlotSelect
          value={time}
          onChange={handleTimeChange}
          label="Heure"
          error={errors.time}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={guestsInputId}
          className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
        >
          Nombre de couverts
        </label>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange({ guests: Math.max(1, guests - 1) })}
            disabled={guests <= 1}
            aria-label="Diminuer le nombre de couverts"
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>

          <input
            ref={guestsInputRef}
            type="number"
            id={guestsInputId}
            min={1}
            max={10}
            value={guests}
            onChange={handleGuestsChange}
            aria-invalid={errors.guests ? 'true' : 'false'}
            aria-describedby={errors.guests ? guestsErrorId : undefined}
            className="flex-1 rounded-lg bg-surface-container-high px-4 py-3 text-center text-2xl font-bold text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />

          <button
            type="button"
            onClick={() => onChange({ guests: Math.min(10, guests + 1) })}
            disabled={guests >= 10}
            aria-label="Augmenter le nombre de couverts"
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>

        {errors.guests && (
          <p
            id={guestsErrorId}
            role="alert"
            className="text-xs text-error"
          >
            {errors.guests}
          </p>
        )}
      </div>

      <p className="text-xs text-on-surface-variant">
        Sélectionnez la date, l'heure et le nombre de personnes pour votre réservation.
      </p>
    </div>
  );
}

export default DateTimeStep;
