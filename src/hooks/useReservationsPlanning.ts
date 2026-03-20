// src/hooks/useReservationsPlanning.ts
// Hook pour la gestion du planning des réservations

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Reservation as DbReservation } from '../db/types';
import type { OccupancyStats } from '../components/serveur/types';

/**
 * Hook pour récupérer les réservations du jour
 * @returns Réservations du jour triées par heure
 */
export function useTodayReservations() {
  const today = new Date().toISOString().split('T')[0];
  
  const reservations = useLiveQuery<DbReservation[]>(
    () =>
      db.reservations
        .where('date')
        .equals(today)
        .sortBy('time'),
    [today]
  );

  return reservations || [];
}

/**
 * Hook pour récupérer les prochaines arrivées
 * @param limit - Nombre maximum de réservations à retourner
 * @returns Prochaines réservations à venir
 */
export function useUpcomingArrivals(limit = 5) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const reservations = useLiveQuery<DbReservation[]>(
    async () => {
      const allReservations = await db.reservations
        .where('date')
        .equals(today)
        .filter((r) => r.status !== 'annule')
        .toArray();

      // Filtrer les réservations futures ou actuelles
      const upcoming = allReservations.filter((r) => r.time >= currentTime);

      // Trier par heure et limiter
      return upcoming
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, limit);
    },
    [today, currentTime, limit]
  );

  return reservations || [];
}

/**
 * Hook pour récupérer les stats d'occupation
 * @returns Stats d'occupation des tables
 */
export function useOccupancyStats() {
  const tables = useLiveQuery(
    () => db.restaurantTables.toArray(),
    []
  );

  const stats: OccupancyStats = {
    free: 0,
    occupied: 0,
    reserved: 0,
    total: 0,
  };

  if (tables) {
    stats.total = tables.length;
    stats.free = tables.filter((t) => t.status === 'libre').length;
    stats.occupied = tables.filter((t) => t.status === 'occupee' || t.status === 'pret').length;
    stats.reserved = tables.filter((t) => t.status === 'reserve').length;
  }

  return stats;
}

/**
 * Hook pour récupérer une réservation spécifique
 * @param reservationId - ID de la réservation
 * @returns La réservation ou undefined
 */
export function useReservation(reservationId: number) {
  const reservation = useLiveQuery<DbReservation | undefined>(
    () => db.reservations.get(reservationId),
    [reservationId]
  );

  return reservation;
}

/**
 * Hook pour récupérer les réservations par statut
 * @param status - Statut à filtrer
 * @returns Réservations avec ce statut
 */
export function useReservationsByStatus(status: string) {
  const reservations = useLiveQuery<DbReservation[]>(
    () =>
      db.reservations
        .where('status')
        .equals(status)
        .sortBy('time'),
    [status]
  );

  return reservations || [];
}

/**
 * Calculer le format d'heure affiché
 * @param time - Heure au format HH:mm
 * @returns Objet avec heure et minute séparées
 */
export function parseTime(time: string) {
  const [hours, minutes] = time.split(':');
  return {
    hours,
    minutes,
    display: `${hours}:${minutes}`,
  };
}

/**
 * Déterminer si une réservation est en retard
 * @param reservationTime - Heure de réservation HH:mm
 * @returns true si en retard
 */
export function isReservationLate(reservationTime: string): boolean {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return currentTime > reservationTime;
}
