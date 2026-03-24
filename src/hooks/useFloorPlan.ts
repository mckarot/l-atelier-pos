// src/hooks/useFloorPlan.ts
// Hook pour la gestion du plan de salle — Migré Firebase Firestore

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { TableRecord, Order, TableStatus } from '../firebase/types';
import type { FloorTable, TableOrder } from '../components/serveur/types';

/**
 * Hook pour récupérer les tables du plan de salle avec leurs commandes associées
 * @param sectorFilter - Filtre optionnel par secteur (ex: "Terrasse", "Salle")
 * @returns Tableau des tables avec leurs commandes
 */
export function useFloorPlan(sectorFilter?: string) {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const db = getDb();

    // Écouter les tables
    const tablesQuery = query(collection(db, 'tables'), orderBy('id', 'asc'));
    const unsubscribeTables = onSnapshot(
      tablesQuery,
      (snapshot) => {
        const fetchedTables = snapshot.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data(),
        }) as TableRecord);
        setTables(fetchedTables);
      },
      (err) => {
        console.error('[useFloorPlan] Tables error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    // Écouter les commandes actives
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }) as Order[]);

        // Filtrer les commandes actives
        const active = fetchedOrders.filter(o =>
          ['attente', 'preparation', 'pret'].includes(o.status)
        );
        setActiveOrders(active);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useFloorPlan] Orders error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeTables();
      unsubscribeOrders();
    };
  }, []);

  // Enrichir les tables avec les données de commandes
  const floorTables: FloorTable[] = tables.map((table) => {
    const order = activeOrders.find((o) => o.tableId === table.id);

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
        startTime: order.createdAt?.toMillis() || Date.now(),
        customerName: order.customerName,
        notes: order.notes,
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
    isLoading,
    error,
  };
}

/**
 * Hook pour récupérer une table spécifique avec sa commande
 * @param tableId - ID de la table
 * @returns La table enrichie ou undefined
 */
export function useTable(tableId: number) {
  const [table, setTable] = useState<TableRecord | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const db = getDb();
    const tableRef = doc(db, 'tables', tableId.toString());

    const unsubscribeTable = onSnapshot(
      tableRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setTable({ id: parseInt(docSnap.id), ...docSnap.data() } as TableRecord);

          // Récupérer la commande associée
          const tableData = docSnap.data();
          if (tableData.currentOrderId) {
            const orderRef = doc(db, 'orders', tableData.currentOrderId.toString());
            getDoc(orderRef).then((orderSnap) => {
              if (orderSnap.exists()) {
                setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
              }
              setIsLoading(false);
            }).catch((err) => {
              console.error('[useTable] Order error:', err);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        } else {
          setTable(null);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('[useTable] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribeTable();
  }, [tableId]);

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
      startTime: order.createdAt?.toMillis() || Date.now(),
      customerName: order.customerName,
      notes: order.notes,
    };
  }

  return {
    ...table,
    name: `T.${table.id.toString().padStart(2, '0')}`,
    sector: table.sector || 'Salle',
    currentOrder: tableOrder,
    isLoading,
    error,
  };
}

/**
 * Hook pour récupérer le temps écoulé depuis le début d'une commande
 * @param startTime - Timestamp de début
 * @returns Temps écoulé en minutes
 */
export function useElapsedTime(startTime: number | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 60000); // minutes
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

/**
 * Hook pour récupérer les statistiques d'occupation
 */
export function useOccupancyStats() {
  const [stats, setStats] = useState({
    totalTables: 0,
    occupiedTables: 0,
    occupancyRate: 0,
    avgTurnoverTime: 0,
  });

  // Implementation à compléter avec les vraies stats
  return stats;
}
