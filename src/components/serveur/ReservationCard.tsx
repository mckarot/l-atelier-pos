// src/components/serveur/ReservationCard.tsx
// Carte de réservation pour le planning

import { cn } from '../../utils/cn';
import type { Reservation as ReservationType } from '../../db/types';

export interface ReservationCardProps {
  reservation: ReservationType;
  onCheckIn?: (reservationId: number) => void;
  onCancel?: (reservationId: number) => void;
  compact?: boolean;
}

export function ReservationCard({
  reservation,
  onCheckIn,
  onCancel,
  compact = false,
}: ReservationCardProps): JSX.Element {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirme':
        return 'bg-tertiary/10 text-tertiary border-tertiary';
      case 'arrive':
        return 'bg-primary/10 text-primary border-primary';
      case 'en_attente':
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
      case 'annule':
        return 'bg-error/10 text-error border-error';
      default:
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirme: 'CONFIRMÉ',
      arrive: 'ARRIVÉ',
      en_attente: 'EN ATTENTE',
      annule: 'ANNULÉ',
    };
    return labels[status] || status;
  };

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return { hours, minutes };
  };

  const time = parseTime(reservation.time);
  const isLate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) > reservation.time;

  if (compact) {
    return (
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-on-surface">{time.hours}</span>
              <span className="font-mono text-xl text-on-surface-variant">:{time.minutes}</span>
            </div>
            <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider">HEURE</span>
          </div>
          <span
            className={cn(
              'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border',
              getStatusStyles(reservation.status)
            )}
          >
            {getStatusLabel(reservation.status)}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-on-surface font-medium">{reservation.customerName}</p>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">group</span>
              {reservation.guests} pers.
            </span>
            {reservation.tableId && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">table_restaurant</span>
                T.{reservation.tableId.toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {reservation.notes && (
          <div className="mt-3 pt-3 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant italic">{reservation.notes}</p>
          </div>
        )}

        {/* Actions */}
        {reservation.status === 'confirme' && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onCheckIn?.(reservation.id)}
              className="flex-1 bg-primary-container text-on-primary-container font-bold py-2 rounded-lg text-sm hover:brightness-110 transition-colors"
              aria-label="Enregistrer l'arrivée"
            >
              ARRIVÉE
            </button>
            <button
              onClick={() => onCancel?.(reservation.id)}
              className="px-3 bg-surface-container-highest text-on-surface-variant font-medium py-2 rounded-lg text-sm hover:bg-error-container/20 hover:text-error transition-colors"
              aria-label="Annuler la réservation"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* QR Code button for upcoming arrivals */}
        {reservation.status === 'confirme' && (
          <button
            className="mt-2 w-full bg-primary-container/20 text-primary font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container/30 transition-colors"
            aria-label="Afficher le QR code"
          >
            <span className="material-symbols-outlined">qr_code</span>
            <span className="text-xs">QR CODE</span>
          </button>
        )}
      </div>
    );
  }

  // Full card view (for table view)
  return (
    <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-highest rounded-lg p-2">
            <span className="font-mono text-lg font-bold text-primary">
              {reservation.time}
            </span>
          </div>
          <div>
            <p className="text-on-surface font-medium">{reservation.customerName}</p>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span>
                {reservation.guests} pers.
              </span>
              {reservation.tableId && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">table_restaurant</span>
                  T.{reservation.tableId.toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider',
            getStatusStyles(reservation.status)
          )}
        >
          {getStatusLabel(reservation.status)}
        </span>
      </div>

      {reservation.notes && (
        <div className="mt-3 pt-3 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant italic">{reservation.notes}</p>
        </div>
      )}
    </div>
  );
}
