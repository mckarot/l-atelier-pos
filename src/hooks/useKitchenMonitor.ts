// src/hooks/useKitchenMonitor.ts
// Hook Firebase pour récupérer les commandes cuisine et les alertes stock

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, type Timestamp } from 'firebase/firestore';
import { getDb } from '../firebase/config';
import type { Order, OrderStatus, MenuItem } from '../firebase/types';

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
  id: string; // Firestore ID (string)
  tableId: number;
  items: KitchenOrderItem[];
  elapsedTime: number; // en secondes
  status: 'preparation' | 'retard';
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
  'attente',
  'preparation',
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
  const createdMs = order.createdAt instanceof Timestamp 
    ? order.createdAt.toMillis() 
    : order.createdAt;
  const diffMs = now - createdMs;
  return Math.floor(diffMs / 1000); // Convertir en secondes
}

/**
 * Détermine le statut de la commande basé sur le temps écoulé
 */
function determineOrderStatus(elapsedSeconds: number): KitchenOrder['status'] {
  if (elapsedSeconds >= RETARD_THRESHOLD_SECONDS) {
    return 'retard';
  }
  return 'preparation';
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
function formatOrderId(orderId: string): string {
  // Pour les IDs Firestore (strings), on prend les 4 derniers caractères
  const numericPart = orderId.slice(-4);
  return `#ORD-${numericPart.padStart(4, '0')}`;
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
 * Utilise onSnapshot pour une mise à jour réactive
 *
 * @returns Tableau de KitchenOrder trié par priorité (retard en premier)
 */
export function useKitchenOrders(): KitchenOrder[] | undefined {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const ordersRef = collection(getDb(), 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        setAllOrders(orders);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useKitchenOrders] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculer les données dérivées avec useMemo
  return useMemo(() => {
    if (isLoading || error) {
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
  }, [allOrders, isLoading, error]);
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
 * Hook pour récupérer les articles du menu
 */
export function useMenuItems(): MenuItem[] | undefined {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const menuItemsRef = collection(getDb(), 'menuItems');
    const q = query(menuItemsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as MenuItem));
        setMenuItems(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMenuItems] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return isLoading || error ? undefined : menuItems;
}

/**
 * Hook pour récupérer l'alerte de stock critique
 * Basé sur les articles du menu avec isAvailable = false (épuisés) ou faible stock
 *
 * @returns StockAlert | undefined
 */
export function useStockAlert(): StockAlert | undefined {
  const allMenuItems = useMenuItems();

  return useMemo(() => {
    if (!allMenuItems) {
      return undefined;
    }

    // Compter les articles épuisés (isAvailable = false)
    const depletedCount = allMenuItems.filter(item => item.isAvailable === false).length;

    // Compter les articles en dessous du seuil de sécurité
    // Dans cette implémentation, on simule le seuil de sécurité
    // En production, cela viendrait d'un champ stockQuantity dans MenuItem
    const lowStockCount = allMenuItems.filter(item => {
      // Simulation: on considère qu'un article est en stock faible
      // s'il est disponible mais que son prix est bas (arbitraire)
      return item.isAvailable === true && item.price < 15;
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
