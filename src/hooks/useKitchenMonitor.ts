// src/hooks/useKitchenMonitor.ts
// Hook Dexie pour récupérer les commandes cuisine et les alertes stock

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Order, OrderStatus } from '../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES TYPESCRIPT
// ─────────────────────────────────────────────────────────────────────────────

/** Item individuel dans une commande cuisine */
export interface KitchenOrderItem {
  name: string;
  quantity: number;
}

/** Commande cuisine en cours de préparation */
export interface KitchenOrder {
  id: number;
  tableId: number;
  items: KitchenOrderItem[];
  elapsedTime: number; // en secondes
  status: 'en_preparation' | 'retard';
}

/** Alerte de stock critique */
export interface StockAlert {
  depletedCount: number; // Articles épuisés
  lowStockCount: number; // Articles en dessous du seuil de sécurité
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Seuil de retard en secondes (20 minutes) */
const RETARD_THRESHOLD_SECONDS = 20 * 60;

/** Statuts de commande considérés comme "en cuisine" */
const KITCHEN_ORDER_STATUSES: OrderStatus[] = [
  'en_attente',
  'en_preparation',
  'pret',
];

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule le temps écoulé depuis la création de la commande (en secondes)
 */
function calculateElapsedTime(order: Order): number {
  const now = Date.now();
  const diffMs = now - order.createdAt;
  return Math.floor(diffMs / 1000); // Convertir en secondes
}

/**
 * Détermine le statut de la commande basé sur le temps écoulé
 */
function determineOrderStatus(elapsedSeconds: number): KitchenOrder['status'] {
  if (elapsedSeconds >= RETARD_THRESHOLD_SECONDS) {
    return 'retard';
  }
  return 'en_preparation';
}

/**
 * Convertit les items de commande en KitchenOrderItem
 */
function convertOrderItems(items: Order['items']): KitchenOrderItem[] {
  return items.map(item => ({
    name: item.name,
    quantity: item.quantity,
  }));
}

/**
 * Formate le numéro de commande (ex: "#ORD-2841")
 */
function formatOrderId(orderId: number): string {
  return `#ORD-${orderId.toString().padStart(4, '0')}`;
}

/**
 * Formate le nom de la table (ex: "Table 04")
 */
function formatTableName(tableId: number): string {
  return `Table ${tableId.toString().padStart(2, '0')}`;
}

/**
 * Trie les commandes cuisine par statut (retard en premier) puis par temps écoulé
 */
function sortKitchenOrders(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) => {
    // Priorité par statut (retard en premier)
    if (a.status === 'retard' && b.status !== 'retard') return -1;
    if (b.status === 'retard' && a.status !== 'retard') return 1;

    // Puis par temps écoulé décroissant
    return b.elapsedTime - a.elapsedTime;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook pour récupérer les commandes cuisine en direct
 * Utilise useLiveQuery pour une mise à jour réactive
 *
 * @returns Tableau de KitchenOrder trié par priorité (retard en premier)
 */
export function useKitchenOrders(): KitchenOrder[] | undefined {
  // Récupérer toutes les commandes via Dexie
  const allOrders = useLiveQuery(
    () => db.orders.orderBy('createdAt').toArray(),
    []
  );

  // Calculer les données dérivées avec useMemo
  return useMemo(() => {
    if (!allOrders) {
      return undefined;
    }

    // Filtrer les commandes actives (en cuisine)
    const activeOrders = allOrders.filter(order =>
      KITCHEN_ORDER_STATUSES.includes(order.status)
    );

    // Convertir en KitchenOrder
    const orders: KitchenOrder[] = activeOrders.map(order => {
      const elapsedSeconds = calculateElapsedTime(order);

      return {
        id: order.id,
        tableId: order.tableId,
        items: convertOrderItems(order.items),
        elapsedTime: elapsedSeconds,
        status: determineOrderStatus(elapsedSeconds),
      };
    });

    // Trier par statut (retard en premier) puis par temps écoulé
    return sortKitchenOrders(orders);
  }, [allOrders]);
}

/**
 * Hook pour récupérer les commandes cuisine formatées pour l'affichage
 * Inclut les formats affichés (orderId, tableName, timeDisplay)
 */
export function useFormattedKitchenOrders(): Array<
  KitchenOrder & {
    orderIdDisplay: string;
    tableNameDisplay: string;
    timeDisplay: string;
  }
> | undefined {
  const orders = useKitchenOrders();

  return useMemo(() => {
    if (!orders) return undefined;

    return orders.map(order => {
      const minutes = Math.floor(order.elapsedTime / 60);
      const seconds = order.elapsedTime % 60;
      const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      return {
        ...order,
        orderIdDisplay: formatOrderId(order.id),
        tableNameDisplay: formatTableName(order.tableId),
        timeDisplay,
      };
    });
  }, [orders]);
}

/**
 * Hook pour récupérer l'alerte de stock critique
 * Basé sur les articles du menu avec isAvailable = 0 (épuisés) ou faible stock
 *
 * @returns StockAlert | undefined
 */
export function useStockAlert(): StockAlert | undefined {
  // Récupérer tous les articles du menu
  const allMenuItems = useLiveQuery(
    () => db.menuItems.toArray(),
    []
  );

  return useMemo(() => {
    if (!allMenuItems) {
      return undefined;
    }

    // Compter les articles épuisés (isAvailable = 0)
    const depletedCount = allMenuItems.filter(item => item.isAvailable === 0).length;

    // Compter les articles en dessous du seuil de sécurité
    // Dans cette implémentation, on simule le seuil de sécurité
    // En production, cela viendrait d'un champ stockQuantity dans MenuItem
    const lowStockCount = allMenuItems.filter(item => {
      // Simulation: on considère qu'un article est en stock faible
      // s'il est disponible mais que son nom contient certains mots-clés
      // Dans une vraie implémentation, on aurait un champ stockQuantity
      return item.isAvailable === 1 && item.price < 15; // Exemple arbitraire
    }).length;

    return {
      depletedCount,
      lowStockCount,
    };
  }, [allMenuItems]);
}

/**
 * Hook utilitaire pour obtenir le nombre de commandes en cours
 */
export function useKitchenOrdersCount(): number {
  const orders = useKitchenOrders();
  return orders?.length || 0;
}

/**
 * Hook utilitaire pour obtenir le nombre de commandes en retard
 */
export function useRetardOrdersCount(): number {
  const orders = useKitchenOrders();

  return useMemo(() => {
    if (!orders) return 0;
    return orders.filter(o => o.status === 'retard').length;
  }, [orders]);
}

export default useKitchenOrders;
