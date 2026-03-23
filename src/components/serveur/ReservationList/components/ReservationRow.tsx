// src/components/serveur/ReservationList/components/ReservationRow.tsx
// Ligne de réservation dans la table

import { type JSX } from 'react';
import { cn } from '../../../../utils/cn';
import type { Reservation } from '../../../../db/types';

export interface ReservationRowProps {
  /** Réservation à afficher */
  reservation: Reservation;
  /** Callback pour le check-in */
  onCheckIn?: (id: number) => void;
  /** Callback pour l'édition */
  onEdit?: (id: number) => void;
  /** Callback pour l'annulation */
  onCancel?: (id: number) => void;
}

/**
 * Mapping des statuts vers les couleurs pour StatusBadge
 */
const STATUS_CONFIG: Record<
  Reservation['status'],
  { label: string; colorClass: string; icon: string }
> = {
  confirme: {
    label: 'Confirmé',
    colorClass: 'bg-primary-container text-on-primary-container',
    icon: 'check_circle',
  },
  en_attente: {
    label: 'En attente',
    colorClass: 'bg-surface-container-highest text-on-surface-variant',
    icon: 'schedule',
  },
  annule: {
    label: 'Annulé',
    colorClass: 'bg-error-container text-on-error-container',
    icon: 'cancel',
  },
  arrive: {
    label: 'Arrivé',
    colorClass: 'bg-tertiary text-on-tertiary-container',
    icon: 'done_all',
  },
};

/**
 * Ligne de réservation dans la table
 * - Heure (font-mono)
 * - Nom client
 * - Couverts + icône group
 * - Table assignée ou "—"
 * - StatusBadge (coloré par statut)
 * - Bouton "Marquer comme arrivé" (si status === 'confirme')
 */
export function ReservationRow({
  reservation,
  onCheckIn,
  onEdit,
  onCancel,
}: ReservationRowProps): JSX.Element {
  const config = STATUS_CONFIG[reservation.status];

  return (
    <tr className="border-b border-surface-variant transition-colors hover:bg-surface-container-high/50">
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-semibold text-on-surface">
          {reservation.time}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            person
          </span>
          <span className="text-sm font-medium text-on-surface">
            {reservation.customerName}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            groups
          </span>
          <span className="text-sm text-on-surface">
            {reservation.guests}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-on-surface-variant">
          {reservation.tableId ? `Table ${reservation.tableId}` : '—'}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-widest',
            config.colorClass
          )}
          role="status"
          aria-label={`Statut: ${config.label}`}
        >
          <span className="material-symbols-outlined text-xs">
            {config.icon}
          </span>
          {config.label}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {reservation.status === 'confirme' && onCheckIn && (
            <button
              onClick={() => onCheckIn(reservation.id)}
              aria-label={`Marquer ${reservation.customerName} comme arrivé`}
              className="rounded-lg bg-primary-container px-3 py-1.5 text-sm font-medium text-on-primary-container transition-colors hover:bg-primary-container/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(reservation.id)}
              aria-label={`Modifier ${reservation.customerName}`}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}

          {onCancel && reservation.status !== 'annule' && (
            <button
              onClick={() => onCancel(reservation.id)}
              aria-label={`Annuler ${reservation.customerName}`}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-error"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ReservationRow;
