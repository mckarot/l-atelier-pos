// src/hooks/useActiveTables.ts
// Hook pour récupérer les tables actives (occupées ou en réservation) — Migré Firebase

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { TableRecord } from '../firebase/types';

/**
 * Hook pour récupérer les tables actives
 * @returns Tableau des tables actives
 */
export function useActiveTables() {
  const [activeTables, setActiveTables] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const db = getDb();

    // Écouter les tables occupées
    const occupiedQuery = query(
      collection(db, 'tables'),
      where('status', '==', 'occupee'),
      orderBy('id', 'asc')
    );

    const unsubscribeOccupied = onSnapshot(
      occupiedQuery,
      (snapshot) => {
        const occupied = snapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data(),
        }) as TableRecord);

        // Écouter les tables en réservation
        const reservationQuery = query(
          collection(db, 'tables'),
          where('status', '==', 'reservation'),
          orderBy('id', 'asc')
        );

        const unsubscribeReservation = onSnapshot(
          reservationQuery,
          (snap) => {
            const reserved = snap.docs.map(doc => ({
              id: parseInt(doc.id),
              ...doc.data(),
            }) as TableRecord);

            // Combiner les deux
            setActiveTables([...occupied, ...reserved]);
            setIsLoading(false);
          },
          (err) => {
            console.error('[useActiveTables] Reservation error:', err);
            setError(err instanceof Error ? err : new Error('Erreur Firestore'));
            setIsLoading(false);
          }
        );

        return () => unsubscribeReservation();
      },
      (err) => {
        console.error('[useActiveTables] Occupied error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribeOccupied();
  }, []);

  return { activeTables, isLoading, error };
}

/**
 * Hook pour récupérer une table par ID
 * @param tableId - ID de la table
 * @returns La table ou null
 */
export function useTableById(tableId: number) {
  const [table, setTable] = useState<TableRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const db = getDb();
    const tableRef = doc(db, 'tables', tableId.toString());

    const unsubscribe = onSnapshot(
      tableRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setTable({ id: parseInt(docSnap.id), ...docSnap.data() } as TableRecord);
        } else {
          setTable(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[useTableById] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tableId]);

  return { table, isLoading, error };
}
