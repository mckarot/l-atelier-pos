// src/hooks/useTables.ts
// Hooks Dexie pour la gestion des tables

import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { db } from '../db/database';
import type { TableRecord, TableStatus, CreateTableInput } from '../db/types';

/**
 * Récupère toutes les tables du restaurant
 * Utilise l'index `status` pour le filtrage optionnel
 * @returns Observable de toutes les tables triées par id
 */
export function useAllTables() {
  const [tables, setTables] = useState<TableRecord[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.restaurantTables.orderBy('id').toArray()
    ).subscribe({
      next: setTables,
      error: (err) => console.error('[useAllTables] liveQuery error:', err),
    });

    return () => subscription.unsubscribe();
  }, []);

  return tables;
}

/**
 * Récupère une table spécifique par son ID
 * Utilise l'index primaire `id` pour une recherche O(1)
 * @param tableId - Numéro de la table
 * @returns La table ou undefined
 */
export function useTable(tableId: number) {
  const [table, setTable] = useState<TableRecord | undefined>();

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.restaurantTables.get(tableId)
    ).subscribe({
      next: setTable,
      error: (err) => console.error('[useTable] liveQuery error:', err),
    });

    return () => subscription.unsubscribe();
  }, [tableId]);

  return table;
}

/**
 * Récupère les tables filtrées par statut
 * Utilise l'index `status` pour un filtrage O(log n)
 * @param status - Statut à filtrer ('libre', 'occupee', 'pret', 'reserve')
 * @returns Observable des tables avec ce statut
 */
export function useTablesByStatus(status: TableStatus) {
  const [tables, setTables] = useState<TableRecord[]>([]);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.restaurantTables
        .where('status')
        .equals(status)
        .sortBy('id')
    ).subscribe({
      next: setTables,
      error: (err) => console.error('[useTablesByStatus] liveQuery error:', err),
    });

    return () => subscription.unsubscribe();
  }, [status]);

  return tables;
}

/**
 * Crée une nouvelle table en base
 * @param input - Données de création (sans currentOrderId)
 * @returns ID de la table créée
 */
export async function createTable(input: CreateTableInput): Promise<number> {
  const id = await db.restaurantTables.add(input);
  return id;
}

/**
 * Met à jour le statut d'une table
 * Utilisé pour changer l'état (libre → occupee → pret → libre)
 * @param tableId - ID de la table
 * @param status - Nouveau statut
 * @param currentOrderId - ID de la commande en cours (optionnel)
 */
export async function updateTableStatus(
  tableId: number,
  status: TableStatus,
  currentOrderId?: number
): Promise<void> {
  const updates: Partial<TableRecord> = { status };

  if (currentOrderId !== undefined) {
    updates.currentOrderId = currentOrderId;
  } else if (status === 'libre') {
    // Si la table devient libre, on retire currentOrderId
    updates.currentOrderId = undefined;
  }

  await db.restaurantTables.update(tableId, updates);
}

/**
 * Récupère les tables libres disponibles
 * Utilise l'index `status` pour filtrer uniquement les tables 'libre'
 * @returns Observable des tables libres
 */
export function useAvailableTables() {
  return useTablesByStatus('libre');
}

/**
 * Récupère les tables occupées (en service)
 * Utilise l'index `status` pour filtrer uniquement les tables 'occupee'
 * @returns Observable des tables occupées
 */
export function useOccupiedTables() {
  return useTablesByStatus('occupee');
}
