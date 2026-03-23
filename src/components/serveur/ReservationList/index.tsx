// src/components/serveur/ReservationList/index.tsx
// Liste des réservations du jour avec table HTML

import { type JSX, useState } from 'react';
import { Button } from '../../ui/Button';
import { ReservationRow } from './components/ReservationRow';
import { useTodayReservationsList } from '../../../hooks/useTodayReservationsList';
import { updateReservationStatus } from '../../../hooks/useReservations';

export interface ReservationListProps {
  /** Callback d'ouverture du modal de nouvelle réservation */
  onOpenNewReservation: () => void;
  /** Callback d'édition d'une réservation */
  onEditReservation?: (id: number) => void;
}

/**
 * Liste des réservations du jour
 * - Header avec titre + bouton "Nouvelle Réservation"
 * - Table HTML avec colonnes : Heure, Client, Couverts, Table, Statut, Actions
 * - Empty state si aucune réservation
 */
export function ReservationList({
  onOpenNewReservation,
  onEditReservation,
}: ReservationListProps): JSX.Element {
  const { reservations, isLoading, error, refresh } = useTodayReservationsList();
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  /** Gestion du check-in */
  const handleCheckIn = async (reservationId: number) => {
    setIsProcessing(reservationId);
    try {
      await updateReservationStatus(reservationId, 'arrive');
      await refresh();
    } catch (error) {
      console.error('Erreur lors du check-in:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  /** Gestion de l'annulation */
  const handleCancel = async (reservationId: number) => {
    if (window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      setIsProcessing(reservationId);
      try {
        await updateReservationStatus(reservationId, 'annule');
        await refresh();
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      } finally {
        setIsProcessing(null);
      }
    }
  };

  /** Gestion de l'édition */
  const handleEdit = (reservationId: number) => {
    onEditReservation?.(reservationId);
  };

  /** Date du jour formatée */
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Réservations
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant capitalize">
            {today}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenNewReservation}
          aria-label="Nouvelle réservation"
        >
          <span className="material-symbols-outlined">add</span>
          Nouvelle Réservation
        </Button>
      </div>

      {isLoading && (
        <div
          aria-busy="true"
          aria-live="polite"
          className="flex items-center justify-center py-12 text-on-surface-variant"
        >
          <span className="material-symbols-outlined animate-spin text-3xl">
            progress_activity
          </span>
          <span className="ml-3 text-sm">Chargement des réservations…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-error-container p-4 text-on-error-container"
        >
          <p className="font-semibold">Une erreur est survenue</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-high py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                event_busy
              </span>
              <p className="mt-4 text-sm font-medium text-on-surface">
                Aucune réservation pour aujourd'hui
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Les réservations du jour apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-surface-variant bg-surface-container-low">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-high">
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Heure
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Couverts
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Table
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <ReservationRow
                      key={reservation.id}
                      reservation={reservation}
                      onCheckIn={handleCheckIn}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReservationList;
