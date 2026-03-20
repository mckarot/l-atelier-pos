// src/hooks/useFloorPlan.ts
// Hook pour la gestion du plan de salle

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { TableRecord, Order } from '../db/types';
import type { FloorTable, TableOrder, OrderItem } from '../components/serveur/types';

/**
 * Hook pour récupérer les tables du plan de salle avec leurs commandes associées
 * @param sectorFilter - Filtre optionnel par secteur (ex: "Terrasse", "Salle")
 * @returns Tableau des tables avec leurs commandes
 */
export function useFloorPlan(sectorFilter?: string) {
  // Récupérer toutes les tables
  const tables = useLiveQuery<TableRecord[]>(
    () => db.restaurantTables.orderBy('id').toArray(),
    []
  );

  // Récupérer les commandes actives
  const activeOrders = useLiveQuery<Order[]>(
    () =>
      db.orders
        .where('status')
        .anyOf(['en_attente', 'en_preparation', 'pret'])
        .sortBy('createdAt'),
    []
  );

  // Enrichir les tables avec les données de commandes
  const floorTables: FloorTable[] = (tables || []).map((table) => {
    const order = activeOrders?.find((o) => o.tableId === table.id);
    
    let tableOrder: TableOrder | undefined;
    if (order) {
      tableOrder = {
        id: order.id,
        items: order.items.map((item, index) => ({
          ...item,
          id: index,
          price: 0, // Prix à calculer depuis le menu
          quantity: item.quantity,
          customization: item.customization,
        })),
        total: order.total || 0,
        startTime: order.createdAt,
        customerName: order.customerName,
      };
    }

    return {
      ...table,
      name: `T.${table.id.toString().padStart(2, '0')}`,
      sector: table.sector || 'Salle',
      currentOrder: tableOrder,
    };
  });

  // Filtrer par secteur si spécifié
  const filteredTables = sectorFilter
    ? floorTables.filter((table) => table.sector === sectorFilter)
    : floorTables;

  // Récupérer les secteurs uniques
  const sectors = Array.from(new Set(floorTables.map((t) => t.sector)));

  return {
    tables: filteredTables,
    allTables: floorTables,
    sectors,
    activeOrders,
  };
}

/**
 * Hook pour récupérer une table spécifique avec sa commande
 * @param tableId - ID de la table
 * @returns La table enrichie ou undefined
 */
export function useTable(tableId: number) {
  const table = useLiveQuery<TableRecord | undefined>(
    () => db.restaurantTables.get(tableId),
    [tableId]
  );

  const order = useLiveQuery<Order | undefined>(
    () => {
      if (!table?.currentOrderId) return undefined;
      return db.orders.get(table.currentOrderId);
    },
    [table?.currentOrderId]
  );

  if (!table) return undefined;

  let tableOrder: TableOrder | undefined;
  if (order) {
    tableOrder = {
      id: order.id,
      items: order.items.map((item, index) => ({
        ...item,
        id: index,
        price: 0,
        quantity: item.quantity,
        customization: item.customization,
      })),
      total: order.total || 0,
      startTime: order.createdAt,
      customerName: order.customerName,
    };
  }

  return {
    ...table,
    name: `T.${table.id.toString().padStart(2, '0')}`,
    sector: table.sector || 'Salle',
    currentOrder: tableOrder,
  };
}

/**
 * Calculer le temps écoulé depuis le début de la commande
 * @param startTime - Timestamp de début
 * @returns Objet avec minutes et secondes
 */
export function useElapsedTime(startTime: number) {
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  return {
    minutes,
    seconds,
    formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
}
