// src/hooks/useReservationsPlanning.ts
// Hooks Firestore pour le planning des réservations

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Reservation } from '../firebase/types';

/**
 * Récupère les réservations du jour courant
 * @returns Les réservations du jour
 */
export function useTodayReservations(): {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
} {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', today),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useTodayReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { reservations, isLoading, error };
}

/**
 * Récupère les arrivées à venir (30 prochaines minutes)
 * @param limit - Nombre maximum de réservations
 * @returns Les réservations à venir
 */
export function useUpcomingArrivals(
  limit = 5
): { reservations: Reservation[]; isLoading: boolean; error: Error | null } {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', today),
      where('status', '==', 'confirme'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );

        const upcoming = allReservations
          .filter((r) => r.time >= currentTime)
          .slice(0, limit);

        setReservations(upcoming);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useUpcomingArrivals] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit]);

  return { reservations, isLoading, error };
}

/**
 * Récupère les réservations par semaine
 * @param startDate - Date de début de semaine
 * @param endDate - Date de fin de semaine
 * @returns Les réservations de la semaine
 */
export function useWeeklyReservations(
  startDate: string,
  endDate: string
): { reservations: Reservation[]; isLoading: boolean; error: Error | null } {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'reservations'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useWeeklyReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [startDate, endDate]);

  return { reservations, isLoading, error };
}

/**
 * Récupère les statistiques de réservations
 * @param date - Date pour les stats
 * @returns Les statistiques
 */
export function useReservationStats(date: string): {
  total: number;
  arrived: number;
  pending: number;
  cancelled: number;
  totalGuests: number;
  isLoading: boolean;
} {
  const [stats, setStats] = useState({
    total: 0,
    arrived: 0,
    pending: 0,
    cancelled: 0,
    totalGuests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', date)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allReservations = snapshot.docs.map(
          (doc) => doc.data() as Reservation
        );

        setStats({
          total: allReservations.length,
          arrived: allReservations.filter((r) => r.status === 'arrive').length,
          pending: allReservations.filter(
            (r) => r.status === 'attente'
          ).length,
          cancelled: allReservations.filter((r) => r.status === 'annule')
            .length,
          totalGuests: allReservations.reduce(
            (sum, r) => sum + (r.guests || 0),
            0
          ),
        });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [date]);

  return { ...stats, isLoading };
}
