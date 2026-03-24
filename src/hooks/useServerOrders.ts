// src/hooks/useServerOrders.ts
// Hook Firestore pour gérer les commandes serveur

import { useCallback } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Order, OrderItem } from '../firebase/types';
import { createOrder as createOrderBase } from './useOrders';

/** Item du panier pour création de commande */
export interface ServerCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  supplements?: Array<{ name: string; price: number }>;
}

export function useServerOrders() {
  /**
   * Créer une nouvelle commande pour une table
   * @param tableId - ID de la table
   * @param items - Items du panier
   * @param customerName - Nom du client (optionnel)
   * @returns ID de la commande créée
   */
  const createOrder = useCallback(
    async (
      tableId: number,
      items: ServerCartItem[],
      customerName?: string
    ): Promise<string> => {
      try {
        // Calculer le total
        const total = items.reduce((sum, item) => {
          const supplementTotal =
            item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
          return sum + (item.price + supplementTotal) * item.quantity;
        }, 0);

        // Mapper les items du panier vers le format OrderItem
        const orderItems: OrderItem[] = items.map((item) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: item.notes,
          supplements: item.supplements?.map((s) => s.name),
        }));

        // Créer la commande via useOrders
        const orderId = await createOrderBase({
          tableId,
          customerName: customerName || 'Commande',
          status: 'attente',
          items: orderItems,
          total,
        });

        // Mettre à jour la table
        const tableRef = doc(db, 'tables', tableId.toString());
        await updateDoc(tableRef, {
          status: 'occupee',
          currentOrderId: parseInt(orderId),
          updatedAt: Timestamp.now(),
        });

        return orderId;
      } catch (error) {
        console.error('[useServerOrders] createOrder error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Ajouter des items à une commande existante
   * @param orderId - ID de la commande
   * @param newItems - Nouveaux items à ajouter
   */
  const addItemsToOrder = useCallback(
    async (orderId: string, newItems: ServerCartItem[]): Promise<void> => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          throw new Error('Commande non trouvée');
        }

        const order = orderSnap.data() as Order;
        const existingItems = order.items || [];

        // Mapper les nouveaux items
        const itemsToAdd: OrderItem[] = newItems.map((item) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: item.notes,
          supplements: item.supplements?.map((s) => s.name),
        }));

        // Calculer le nouveau total
        const additionalTotal = itemsToAdd.reduce((sum, item) => {
          const supplementTotal =
            item.supplements?.reduce((acc, s) => acc + 1, 0) || 0;
          return sum + (item.price + supplementTotal) * item.quantity;
        }, 0);

        // Mettre à jour la commande
        await updateDoc(orderRef, {
          items: [...existingItems, ...itemsToAdd],
          total: (order.total || 0) + additionalTotal,
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('[useServerOrders] addItemsToOrder error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Supprimer un item d'une commande
   * @param orderId - ID de la commande
   * @param itemId - ID de l'item à supprimer
   */
  const removeItemFromOrder = useCallback(
    async (orderId: string, itemId: string): Promise<void> => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          throw new Error('Commande non trouvée');
        }

        const order = orderSnap.data() as Order;
        const existingItems = order.items || [];

        // Filtrer l'item à supprimer
        const itemToRemove = existingItems.find((item) => item.id === itemId);
        const updatedItems = existingItems.filter((item) => item.id !== itemId);

        // Calculer le nouveau total
        const refund = itemToRemove
          ? (itemToRemove.price || 0) * itemToRemove.quantity
          : 0;

        await updateDoc(orderRef, {
          items: updatedItems,
          total: Math.max(0, (order.total || 0) - refund),
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('[useServerOrders] removeItemFromOrder error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Mettre à jour la quantité d'un item
   * @param orderId - ID de la commande
   * @param itemId - ID de l'item
   * @param newQuantity - Nouvelle quantité
   */
  const updateItemQuantity = useCallback(
    async (
      orderId: string,
      itemId: string,
      newQuantity: number
    ): Promise<void> => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          throw new Error('Commande non trouvée');
        }

        const order = orderSnap.data() as Order;
        const existingItems = order.items || [];

        // Mettre à jour la quantité
        const updatedItems = existingItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );

        // Recalculer le total
        const newTotal = updatedItems.reduce((sum, item) => {
          const supplementTotal = item.supplements?.length || 0;
          return sum + (item.price || 0) * item.quantity + supplementTotal;
        }, 0);

        await updateDoc(orderRef, {
          items: updatedItems,
          total: newTotal,
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('[useServerOrders] updateItemQuantity error:', error);
        throw error;
      }
    },
    []
  );

  return {
    createOrder,
    addItemsToOrder,
    removeItemFromOrder,
    updateItemQuantity,
  };
}
