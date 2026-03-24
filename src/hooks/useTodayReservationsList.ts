// src/hooks/useTodayReservationsList.ts
// Hook Firestore pour la liste des réservations du jour

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Reservation } from '../firebase/types';

/** Retour du hook */
interface UseTodayReservationsListReturn {
  /** Liste des réservations du jour */
  reservations: Reservation[];
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
  /** Fonction de rafraîchissement */
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer la liste des réservations du jour
 * - Utilise onSnapshot pour le temps réel
 * - Gère les états loading, error, data
 * - Fournit une fonction de rafraîchissement
 */
export function useTodayReservationsList(): UseTodayReservationsListReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Date du jour au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setIsLoading(true);
    setError(null);

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
        console.error('[useTodayReservationsList] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [today, refreshTrigger]);

  /** Fonction de rafraîchissement */
  const refresh = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    reservations,
    isLoading,
    error,
    refresh,
  };
}
