// src/components/client/ReservationForm.tsx
// Formulaire de réservation avec steps DATE et DÉTAILS

import { useCallback } from 'react';
import { cn, iconFilled } from '../../utils/cn';
import type { Reservation } from '../../firebase/types';

interface DateStepProps {
  data: Partial<Reservation>;
  onUpdate: (data: Partial<Reservation>) => void;
}

function DateStep({ data, onUpdate }: DateStepProps): JSX.Element {
  // Générer les dates pour les 7 prochains jours
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const dayNum = date.getDate();
      const monthName = monthNames[date.getMonth()];

      days.push({
        date: dateStr,
        label: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : `${dayName} ${dayNum} ${monthName}`,
      });
    }

    return days;
  };

  const availableTimes = [
    '12:00', '12:30', '13:00', '13:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  ];

  const handleDateSelect = useCallback((date: string) => {
    onUpdate({ ...data, date });
  }, [data, onUpdate]);

  const handleTimeSelect = useCallback((time: string) => {
    onUpdate({ ...data, time });
  }, [data, onUpdate]);

  const handleGuestsChange = useCallback((guests: number) => {
    onUpdate({ ...data, guests });
  }, [data, onUpdate]);

  const days = getNextDays();

  return (
    <div className="space-y-6">
      {/* Date selection */}
      <section>
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <span
            className={iconFilled()}
            aria-hidden="true"
          >
            calendar_today
          </span>
          Date & Heure
        </h3>

        {/* Date cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {days.map((day) => {
            const isSelected = data.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => handleDateSelect(day.date)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-all text-left',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  isSelected
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                )}
                aria-pressed={isSelected}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Time selection */}
        {data.date && (
          <div className="grid grid-cols-5 gap-2">
            {availableTimes.map((time) => {
              const isSelected = data.time === time;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-mono transition-all',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    isSelected
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
                  )}
                  aria-pressed={isSelected}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Guests selection */}
      <section>
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <span
            className={iconFilled()}
            aria-hidden="true"
          >
            groups
          </span>
          Convives
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleGuestsChange(Math.max(1, (data.guests || 2) - 1))}
            className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors"
            aria-label="Diminuer le nombre de convives"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              remove
            </span>
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-bold font-mono text-primary">
              {data.guests}
            </span>
            <span className="text-sm text-on-surface-variant ml-2">
              {data.guests === 1 ? 'Personne' : 'Personnes'}
            </span>
          </div>
          <button
            onClick={() => handleGuestsChange(Math.min(12, (data.guests || 2) + 1))}
            className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors"
            aria-label="Augmenter le nombre de convives"
          >
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              add
            </span>
          </button>
        </div>
      </section>

      {/* Summary */}
      {data.date && data.time && (
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="text-sm text-on-surface-variant mb-1">Résumé</p>
          <p className="font-medium">
            {days.find((d) => d.date === data.date)?.label} — {data.time}
          </p>
          <p className="text-sm text-on-surface-variant">
            {data.guests} {data.guests === 1 ? 'Personne' : 'Personnes'}
          </p>
        </div>
      )}
    </div>
  );
}

interface DetailsStepProps {
  data: Partial<Reservation>;
  onUpdate: (data: Partial<Reservation>) => void;
}

function DetailsStep({ data, onUpdate }: DetailsStepProps): JSX.Element {
  const handleChange = useCallback((field: keyof Reservation, value: string | number) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  return (
    <div className="space-y-4">
      {/* Customer name */}
      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2"
        >
          Nom complet *
        </label>
        <input
          type="text"
          id="customerName"
          value={data.customerName || ''}
          onChange={(e) => handleChange('customerName', e.target.value)}
          placeholder="Jean Dupont"
          className="w-full px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface border border-outline-variant/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="jean.dupont@email.com"
          className="w-full px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface border border-outline-variant/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2"
        >
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          value={data.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="06 12 34 56 78"
          className="w-full px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface border border-outline-variant/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2"
        >
          Note particulière
        </label>
        <textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Anniversaire, allergie, demande spéciale..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-surface-container-highest text-on-surface border border-outline-variant/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {/* Summary */}
      <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
          Résumé de la Réservation
        </h4>
        {data.date && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Date</span>
            <span className="font-medium">{data.date} à {data.time}</span>
          </div>
        )}
        {data.guests && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Convives</span>
            <span className="font-medium">{data.guests} personnes</span>
          </div>
        )}
        {data.customerName && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Client</span>
            <span className="font-medium">{data.customerName}</span>
          </div>
        )}
        {data.email && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Email</span>
            <span className="font-medium">{data.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const ReservationForm = {
  DateStep,
  DetailsStep,
};
