// src/hooks/useReservations.ts
// Hooks Dexie pour la gestion des réservations

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Reservation, ReservationStatus, CreateReservationInput } from '../db/types';

/**
 * Récupère toutes les réservations
 * Utilise l'index `date` pour le tri chronologique
 * @returns Observable de toutes les réservations
 */
export function useAllReservations(): Reservation[] | undefined {
  return useLiveQuery(
    () => db.reservations
      .orderBy('date')
      .toArray()
      .then((reservations: Reservation[]) =>
        reservations.sort((a, b) => {
          // Tri par date puis par heure
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        })
      ),
    []
  );
}

/**
 * Récupère les réservations pour une date spécifique
 * Utilise l'index `date` pour un filtrage O(log n)
 * @param date - Date au format YYYY-MM-DD
 * @returns Observable des réservations pour cette date
 */
export function useReservationsByDate(date: string): Reservation[] | undefined {
  return useLiveQuery(
    () => db.reservations
      .where('date')
      .equals(date)
      .sortBy('time'),
    [date]
  );
}

/**
 * Récupère les réservations du jour courant
 * Utilise l'index `date` avec la date d'aujourd'hui
 * @returns Observable des réservations du jour
 */
export function useTodayReservations(): Reservation[] | undefined {
  return useLiveQuery(
    () => {
      const today = new Date().toISOString().split('T')[0];
      return db.reservations
        .where('date')
        .equals(today)
        .sortBy('time');
    },
    []
  );
}

/**
 * Récupère les réservations par statut
 * Utilise l'index `status` pour un filtrage O(log n)
 * @param status - Statut à filtrer ('confirme', 'en_attente', 'annule', 'arrive')
 * @returns Observable des réservations avec ce statut
 */
export function useReservationsByStatus(status: ReservationStatus): Reservation[] | undefined {
  return useLiveQuery(
    () => db.reservations
      .where('status')
      .equals(status)
      .toArray()
      .then((results: Reservation[]) =>
        results.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        })
      ),
    [status]
  );
}

/**
 * Récupère une réservation par son ID
 * Utilise l'index primaire `id` pour une recherche O(1)
 * @param reservationId - ID de la réservation
 * @returns La réservation ou undefined
 */
export function useReservation(reservationId: number): Reservation | undefined {
  return useLiveQuery(
    () => db.reservations.get(reservationId),
    [reservationId]
  );
}

/**
 * Crée une nouvelle réservation
 * @param input - Données de création (sans id)
 * @returns ID de la réservation créée
 */
export async function createReservation(input: CreateReservationInput): Promise<number> {
  try {
    // Construire l'objet avec tous les champs requis par le schéma Dexie
    // Note: Dexie accepte les objets sans 'id' pour les tables avec ++id (auto-incrément)
    const newReservation = {
      ...input,
      status: input.status || 'en_attente' as ReservationStatus,
      createdAt: Date.now(),
      referenceNumber: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // db.reservations.add() avec ++id dans le schéma accepte implicitement Omit<Reservation, 'id'>
    // https://dexie.org/docs/Table/Table.add()
    const id = await db.reservations.add(newReservation as any);
    return id;
  } catch (error) {
    console.error('[createReservation] Error:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une réservation
 * @param reservationId - ID de la réservation
 * @param status - Nouveau statut
 */
export async function updateReservationStatus(
  reservationId: number,
  status: ReservationStatus
): Promise<void> {
  try {
    await db.reservations.update(reservationId, { status });
  } catch (error) {
    console.error('[updateReservationStatus] Error:', error);
    throw error;
  }
}

/**
 * Annule une réservation (soft delete via statut 'annule')
 * @param reservationId - ID de la réservation à annuler
 */
export async function cancelReservation(reservationId: number): Promise<void> {
  try {
    await db.reservations.update(reservationId, {
      status: 'annule',
    });
  } catch (error) {
    console.error('[cancelReservation] Error:', error);
    throw error;
  }
}

/**
 * Récupère les réservations à venir (aujourd'hui et futur)
 * Utilise l'index `date` avec un filtre de range
 * @returns Observable des réservations futures
 */
export function useUpcomingReservations(): Reservation[] | undefined {
  const today = new Date().toISOString().split('T')[0];

  return useLiveQuery(
    async () => {
      const allReservations = await db.reservations
        .where('date')
        .aboveOrEqual(today)
        .toArray();

      return allReservations
        .filter(r => r.status !== 'annule')
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    [today]
  );
}
