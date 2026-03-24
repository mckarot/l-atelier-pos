// src/components/client/ReservationConfirmation.tsx
// Confirmation de réservation avec check vert

import { cn, iconFilled } from '../../utils/cn';
import type { Reservation } from '../../firebase/types';

interface ReservationConfirmationProps {
  reservation: Reservation;
}

export function ReservationConfirmation({ reservation }: ReservationConfirmationProps): JSX.Element {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const reservationDate = new Date(reservation.date + 'T00:00:00');
  const dayName = dayNames[reservationDate.getDay()];
  const dayNum = reservationDate.getDate();
  const monthName = monthNames[reservationDate.getMonth()];

  return (
    <div className="space-y-6">
      {/* Success check */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center mb-4 animate-[scaleIn_0.3s_ease-out]">
          <span
            className={cn(iconFilled(), 'text-tertiary text-5xl')}
            aria-hidden="true"
          >
            check_circle
          </span>
        </div>
        <h3 className="text-2xl font-bold font-headline text-center mb-2">
          Réservation Confirmée !
        </h3>
        <p className="text-on-surface-variant text-center">
          Nous vous attendons le {dayName} {dayNum} {monthName}
        </p>
      </div>

      {/* Reservation details */}
      <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <div className="bg-primary-container/20 p-2 rounded-lg">
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              calendar_today
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">
              Date & Heure
            </p>
            <p className="font-medium">
              {dayName} {dayNum} {monthName} — {reservation.time}
            </p>
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-start gap-3">
          <div className="bg-primary-container/20 p-2 rounded-lg">
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              groups
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">
              Convives
            </p>
            <p className="font-medium">
              {reservation.guests} {reservation.guests === 1 ? 'Personne' : 'Personnes'}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-start gap-3">
          <div className="bg-primary-container/20 p-2 rounded-lg">
            <span
              className={iconFilled()}
              aria-hidden="true"
            >
              person
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">
              Client
            </p>
            <p className="font-medium">{reservation.customerName}</p>
            {reservation.email && (
              <p className="text-sm text-on-surface-variant">{reservation.email}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {reservation.notes && (
          <div className="flex items-start gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg">
              <span
                className={iconFilled()}
                aria-hidden="true"
              >
                note_alt
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                Note particulière
              </p>
              <p className="text-sm italic text-on-surface-variant">
                "{reservation.notes}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reservation ID */}
      <div className="text-center">
        <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
          ID Réservation
        </p>
        <p className="font-mono text-2xl font-bold text-primary">
          #{String(reservation.id).padStart(6, '0')}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant/10 pt-4 text-center">
        <p className="text-xs text-on-surface-variant">
          © 2024 L'Atelier POS • Tous droits réservés
        </p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
