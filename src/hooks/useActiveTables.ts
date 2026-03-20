// src/hooks/useActiveTables.ts
// Hook Dexie pour récupérer les tables actives avec leurs commandes

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Order, OrderItem, OrderStatus } from '../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES TYPESCRIPT
// ─────────────────────────────────────────────────────────────────────────────

/** Statut d'un item dans une table active */
export interface TableServiceItem {
  name: string;
  quantity: number;
  status: 'attente' | 'pret' | 'preparation';
}

/** Service de table actif avec toutes ses informations */
export interface TableService {
  orderId: number;
  tableId: number;
  tableName: string;
  status: 'en_preparation' | 'retard' | 'nouveau';
  guests: number;
  server: string;
  items: TableServiceItem[];
  waitTime: number; // en minutes
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Seuil de retard en minutes */
const RETARD_THRESHOLD_MINUTES = 20;

/** Statuts de commande considérés comme "actifs" */
const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'en_attente',
  'en_preparation',
  'pret',
];

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule le temps d'attente en minutes depuis la création de la commande
 */
function calculateWaitTime(order: Order): number {
  const now = Date.now();
  const diffMs = now - order.createdAt;
  return Math.floor(diffMs / 60000); // Convertir en minutes
}

/**
 * Détermine le statut de la table basé sur le temps d'attente
 */
function determineTableStatus(order: Order): TableService['status'] {
  const waitTime = calculateWaitTime(order);

  if (waitTime >= RETARD_THRESHOLD_MINUTES) {
    return 'retard';
  }

  if (order.status === 'en_attente') {
    return 'nouveau';
  }

  return 'en_preparation';
}

/**
 * Convertit les items de commande en TableServiceItem
 */
function convertOrderItems(items: OrderItem[]): TableServiceItem[] {
  return items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    status: item.done ? 'pret' : item.customization ? 'preparation' : 'attente',
  }));
}

/**
 * Formate le nom de la table (ex: "Table 08")
 */
function formatTableName(tableId: number): string {
  return `Table ${tableId.toString().padStart(2, '0')}`;
}

/**
 * Récupère le nom du serveur pour une table
 * Dans une implémentation réelle, cela viendrait d'une table d'affectation
 */
function getServerName(tableId: number): string {
  // Simulation de noms de serveurs basés sur le tableId
  const servers = ['Marc', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Léa'];
  return servers[tableId % servers.length];
}

/**
 * Simule le nombre de personnes pour une table
 */
function getGuestCount(tableId: number): number {
  // Simulation basée sur le tableId
  const baseCount = 2 + (tableId % 4);
  return baseCount;
}

/**
 * Trie les tables actives par statut (retard en premier) puis par temps d'attente
 */
function sortTableServices(services: TableService[]): TableService[] {
  const statusPriority: Record<TableService['status'], number> = {
    retard: 0,
    en_preparation: 1,
    nouveau: 2,
  };

  return [...services].sort((a, b) => {
    // Priorité par statut
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Puis par temps d'attente décroissant
    return b.waitTime - a.waitTime;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook pour récupérer les tables actives avec leurs commandes
 * Utilise useLiveQuery pour une mise à jour réactive
 *
 * @returns Tableau de TableService trié par priorité (retard en premier)
 */
export function useActiveTables(): TableService[] | undefined {
  // Récupérer toutes les commandes et tables via Dexie
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );

  const allTables = useLiveQuery(
    () => db.restaurantTables.toArray(),
    []
  );

  // Calculer les données dérivées avec useMemo
  return useMemo(() => {
    if (!allOrders || !allTables) {
      return undefined;
    }

    // Créer un map des tables pour un accès rapide
    const tableMap = new Map(allTables.map(t => [t.id, t]));

    // Filtrer les commandes actives
    const activeOrders = allOrders.filter(order =>
      ACTIVE_ORDER_STATUSES.includes(order.status)
    );

    // Convertir en TableService
    const services: TableService[] = activeOrders.map(order => {
      const table = tableMap.get(order.tableId);
      const waitTime = calculateWaitTime(order);

      return {
        orderId: order.id,
        tableId: order.tableId,
        tableName: formatTableName(order.tableId),
        status: determineTableStatus(order),
        guests: getGuestCount(order.tableId),
        server: getServerName(order.tableId),
        items: convertOrderItems(order.items),
        waitTime,
        total: order.total || 0,
      };
    });

    // Trier par statut (retard en premier) puis par temps d'attente
    return sortTableServices(services);
  }, [allOrders, allTables]);
}

/**
 * Hook utilitaire pour obtenir le nombre de tables actives
 */
export function useActiveTablesCount(): number {
  const tables = useActiveTables();
  return tables?.length || 0;
}

/**
 * Hook utilitaire pour obtenir le nombre de tables en retard
 */
export function useRetardTablesCount(): number {
  const tables = useActiveTables();

  return useMemo(() => {
    if (!tables) return 0;
    return tables.filter(t => t.status === 'retard').length;
  }, [tables]);
}

export default useActiveTables;
