// src/hooks/useTables.ts
// Hooks Firestore pour la gestion des tables

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { TableRecord, TableStatus, CreateTableInput } from '../firebase/types';

/**
 * Récupère toutes les tables du restaurant
 * Utilise un snapshot temps réel pour les mises à jour automatiques
 * @returns Toutes les tables triées par id
 */
export function useAllTables(): {
  tables: TableRecord[];
  isLoading: boolean;
  error: Error | null;
} {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, 'tables'), orderBy('id', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTables = snapshot.docs.map(
          (doc) =>
            ({
              id: parseInt(doc.id),
              ...doc.data(),
            }) as TableRecord
        );
        setTables(fetchedTables);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAllTables] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { tables, isLoading, error };
}

/**
 * Récupère une table spécifique par son ID
 * @param tableId - Numéro de la table
 * @returns La table ou null
 */
export function useTable(
  tableId: number
): { table: TableRecord | null; isLoading: boolean; error: Error | null } {
  const [table, setTable] = useState<TableRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

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
        console.error('[useTable] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tableId]);

  return { table, isLoading, error };
}

/**
 * Récupère les tables filtrées par statut
 * @param status - Statut à filtrer
 * @returns Les tables avec ce statut
 */
export function useTablesByStatus(
  status: TableStatus
): { tables: TableRecord[]; isLoading: boolean; error: Error | null } {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'tables'),
      where('status', '==', status),
      orderBy('id', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTables = snapshot.docs.map(
          (doc) =>
            ({
              id: parseInt(doc.id),
              ...doc.data(),
            }) as TableRecord
        );
        setTables(fetchedTables);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useTablesByStatus] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { tables, isLoading, error };
}

/**
 * Crée une nouvelle table
 * @param input - Données de création
 */
export async function createTable(input: CreateTableInput): Promise<void> {
  try {
    const tableRef = doc(db, 'tables', input.id.toString());
    await setDoc(tableRef, {
      ...input,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[createTable] Error:', error);
    throw error;
  }
}

/**
 * Met à jour une table existante
 * @param tableId - ID de la table
 * @param updates - Données à mettre à jour
 */
export async function updateTable(
  tableId: number,
  updates: Partial<TableRecord>
): Promise<void> {
  try {
    const tableRef = doc(db, 'tables', tableId.toString());
    await updateDoc(tableRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateTable] Error:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une table
 * @param tableId - ID de la table
 * @param status - Nouveau statut
 */
export async function updateTableStatus(
  tableId: number,
  status: TableStatus
): Promise<void> {
  try {
    const tableRef = doc(db, 'tables', tableId.toString());
    await updateDoc(tableRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateTableStatus] Error:', error);
    throw error;
  }
}

/**
 * Supprime une table
 * @param tableId - ID de la table
 */
export async function deleteTable(tableId: number): Promise<void> {
  try {
    const tableRef = doc(db, 'tables', tableId.toString());
    await deleteDoc(tableRef);
  } catch (error) {
    console.error('[deleteTable] Error:', error);
    throw error;
  }
}
