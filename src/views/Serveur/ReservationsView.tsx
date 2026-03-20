// src/views/Serveur/ReservationsView.tsx
// Vue du planning des réservations

import { useCallback } from 'react';
import { ReservationsPlanning } from '../../components/serveur/ReservationsPlanning';
import { updateReservationStatus } from '../../hooks/useReservations';

export default function ReservationsView(): JSX.Element {
  const handleCheckIn = useCallback(async (reservationId: number) => {
    try {
      await updateReservationStatus(reservationId, 'arrive');
      console.log(`Check-in réussi pour la réservation ${reservationId}`);
    } catch (error) {
      console.error('Erreur lors du check-in:', error);
    }
  }, []);

  const handleCancel = useCallback(async (reservationId: number) => {
    if (window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      try {
        await updateReservationStatus(reservationId, 'annule');
        console.log(`Réservation ${reservationId} annulée`);
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
      }
    }
  }, []);

  return (
    <ReservationsPlanning
      onCheckIn={handleCheckIn}
      onCancel={handleCancel}
    />
  );
}
