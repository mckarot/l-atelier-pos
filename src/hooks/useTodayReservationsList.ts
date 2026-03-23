// src/hooks/useTodayReservationsList.ts
// Hook pour la liste des réservations du jour

import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Reservation } from '../db/types';

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
 * - Utilise useLiveQuery pour la réactivité
 * - Gère les états loading, error, data
 * - Fournit une fonction de rafraîchissement
 */
export function useTodayReservationsList(): UseTodayReservationsListReturn {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Date du jour au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Requête Dexie avec useLiveQuery
  const reservations = useLiveQuery<Reservation[]>(
    () => {
      return db.reservations
        .where('date')
        .equals(today)
        .sortBy('time');
    },
    [today, refreshTrigger]
  );

  // Loading state based on data presence
  const isLoading = !reservations;
  const error: Error | null = null; // useLiveQuery doesn't expose errors directly

  /** Fonction de rafraîchissement */
  const refresh = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    reservations: reservations ?? [],
    isLoading,
    error,
    refresh,
  };
}

export default useTodayReservationsList;
