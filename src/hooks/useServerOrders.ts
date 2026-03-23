// src/hooks/useServerOrders.ts
// Hook pour gérer les commandes serveur

import { useCallback } from 'react';
import { db } from '../db/database';
import type { Order, OrderItem, TableRecord } from '../db/types';

/** Item du panier pour création de commande */
export interface ServerCartItem {
  menuItemId: number;
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
  const createOrder = useCallback(async (
    tableId: number,
    items: ServerCartItem[],
    customerName?: string
  ): Promise<number> => {
    try {
      // Calculer le total
      const total = items.reduce((sum, item) => {
        const supplementTotal = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
        return sum + (item.price + supplementTotal) * item.quantity;
      }, 0);

      // Mapper les items du panier vers le format OrderItem
      const orderItems: OrderItem[] = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customization: item.notes,
        supplements: item.supplements,
      }));

      // Créer la commande
      const orderId = await db.orders.add({
        tableId,
        customerName: customerName || 'Commande',
        status: 'en_attente',
        items: orderItems,
        total,
        createdAt: Date.now(),
      });

      // Mettre à jour la table
      await db.restaurantTables.update(tableId, {
        status: 'occupee',
        currentOrderId: orderId,
      });

      return orderId;
    } catch (error) {
      console.error('[useServerOrders] createOrder error:', error);
      throw error;
    }
  }, []);

  /**
   * Ajouter des items à une commande existante
   * @param orderId - ID de la commande
   * @param newItems - Nouveaux items à ajouter
   */
  const addItemsToOrder = useCallback(async (
    orderId: number,
    newItems: ServerCartItem[]
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) {
        throw new Error(`Commande ${orderId} introuvable`);
      }

      // Mapper les nouveaux items
      const orderItems: OrderItem[] = newItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customization: item.notes,
        supplements: item.supplements,
      }));

      // Concaténer les items
      const updatedItems = [...order.items, ...orderItems];

      // Recalculer le total
      const total = updatedItems.reduce((sum, item) => {
        const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
        return sum + ((item.price || 0) + supplementPrice) * item.quantity;
      }, 0);

      // Mettre à jour la commande
      await db.orders.update(orderId, {
        items: updatedItems,
        total,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[useServerOrders] addItemsToOrder error:', error);
      throw error;
    }
  }, []);

  /**
   * Supprimer un item d'une commande par son index
   * @param orderId - ID de la commande
   * @param itemIndex - Index de l'item à supprimer
   */
  const removeItemFromOrder = useCallback(async (
    orderId: number,
    itemIndex: number
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) {
        throw new Error(`Commande ${orderId} introuvable`);
      }

      if (itemIndex < 0 || itemIndex >= order.items.length) {
        throw new Error(`Index ${itemIndex} hors limites`);
      }

      // Supprimer l'item par index
      const updatedItems = order.items.filter((_, index) => index !== itemIndex);

      // Recalculer le total
      const total = updatedItems.reduce((sum, item) => {
        const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
        return sum + ((item.price || 0) + supplementPrice) * item.quantity;
      }, 0);

      // Mettre à jour la commande
      await db.orders.update(orderId, {
        items: updatedItems,
        total,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[useServerOrders] removeItemFromOrder error:', error);
      throw error;
    }
  }, []);

  /**
   * Mettre à jour la quantité d'un item dans une commande
   * Utilise l'index de l'item comme identifiant (car les items en DB n'ont pas d'ID natif)
   */
  const updateItemQuantity = useCallback(async (
    orderId: number,
    itemIndex: number,
    delta: number
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) return;

      // Utiliser l'index pour identifier l'item
      if (itemIndex < 0 || itemIndex >= order.items.length) return;

      const updatedItems = [...order.items];
      const newQuantity = updatedItems[itemIndex].quantity + delta;

      if (newQuantity <= 0) {
        // Supprimer l'item si quantité <= 0
        updatedItems.splice(itemIndex, 1);
      } else {
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity: newQuantity };
      }

      // Recalculer le total
      const total = updatedItems.reduce((sum, item) => {
        const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
        return sum + ((item.price || 0) + supplementPrice) * item.quantity;
      }, 0);

      await db.orders.update(orderId, {
        items: updatedItems,
        total,
      });
    } catch (error) {
      console.error('[useServerOrders] updateItemQuantity error:', error);
      throw error;
    }
  }, []);

  /**
   * Mettre à jour les notes d'une commande (remplace les notes existantes)
   * Utilisé par FloorPlanView pour le modal de notes
   */
  const updateOrderNotes = useCallback(async (
    orderId: number,
    notes: string
  ): Promise<void> => {
    try {
      await db.orders.update(orderId, {
        notes: notes || undefined,
      });
    } catch (error) {
      console.error('[useServerOrders] updateOrderNotes error:', error);
      throw error;
    }
  }, []);

  /**
   * Ajouter une note à une commande (append)
   * Alternative : ajoute une note à la suite des existantes
   */
  const addNote = useCallback(async (
    orderId: number,
    note: string
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) return;

      const notes = order.notes ? `${order.notes}\n${note}` : note;

      await db.orders.update(orderId, {
        notes,
      });
    } catch (error) {
      console.error('[useServerOrders] addNote error:', error);
      throw error;
    }
  }, []);

  /**
   * Diviser une commande - transfère des items vers une nouvelle commande
   * @param orderId - ID de la commande originale
   * @param tableId - ID de la table (pour la nouvelle commande)
   * @param itemIndices - Indices des items à transférer
   * @param splitType - 'equal' (parts égales) ou 'items' (sélection)
   */
  const splitOrder = useCallback(async (
    orderId: number,
    tableId: number,
    itemIndices: number[],
    splitType: 'equal' | 'items'
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) return;

      if (splitType === 'equal') {
        // Division équitable : 50% du total sur chaque commande
        const halfTotal = (order.total || 0) / 2;
        const halfItems = Math.ceil(order.items.length / 2);

        const items1 = order.items.slice(0, halfItems);
        const items2 = order.items.slice(halfItems);

        // Créer la nouvelle commande avec la moitié des items
        await db.orders.add({
          tableId,
          status: 'en_attente',
          items: items2,
          total: halfTotal,
          createdAt: Date.now(),
          customerName: order.customerName || 'Commande',
        });

        // Mettre à jour la commande originale
        await db.orders.update(orderId, {
          items: items1,
          total: halfTotal,
        });
      } else {
        // Division par items sélectionnés
        const itemsToTransfer = itemIndices.map((i) => order.items[i]).filter(Boolean);
        const itemsToKeep = order.items.filter((_, i) => !itemIndices.includes(i));

        // Calculer les totaux
        const calcTotal = (items: typeof order.items) =>
          items.reduce((sum, item) => {
            const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
            return sum + ((item.price || 0) + supplementPrice) * item.quantity;
          }, 0);

        const totalTransfer = calcTotal(itemsToTransfer);
        const totalKeep = calcTotal(itemsToKeep);

        // Créer la nouvelle commande
        await db.orders.add({
          tableId,
          status: 'en_attente',
          items: itemsToTransfer,
          total: totalTransfer,
          createdAt: Date.now(),
          customerName: order.customerName || 'Commande',
        });

        // Mettre à jour la commande originale
        await db.orders.update(orderId, {
          items: itemsToKeep,
          total: totalKeep,
        });
      }
    } catch (error) {
      console.error('[useServerOrders] splitOrder error:', error);
      throw error;
    }
  }, []);

  /**
   * Compléter un paiement (alias pour checkout - utilisé par FloorPlanView)
   */
  const completePayment = useCallback(async (
    orderId: number,
    tableId: number,
    paymentMethod: 'especes' | 'cb' | 'none'
  ): Promise<void> => {
    try {
      const order = await db.orders.get(orderId);
      if (!order) return;

      // Mettre à jour la commande
      await db.orders.update(orderId, {
        status: 'paye',
        paymentMethod,
        paidAt: Date.now(),
      });

      // Libérer la table
      await db.restaurantTables.update(tableId, {
        status: 'libre',
        currentOrderId: undefined,
      });
    } catch (error) {
      console.error('[useServerOrders] completePayment error:', error);
      throw error;
    }
  }, []);

  /**
   * Payer une commande (alias pour completePayment)
   */
  const checkout = useCallback(async (
    orderId: number,
    tableId: number,
    paymentMethod: 'especes' | 'cb' | 'none'
  ): Promise<void> => {
    try {
      await completePayment(orderId, tableId, paymentMethod);
    } catch (error) {
      console.error('[useServerOrders] checkout error:', error);
      throw error;
    }
  }, [completePayment]);

  return {
    createOrder,
    addItemsToOrder,
    removeItemFromOrder,
    updateItemQuantity,
    updateOrderNotes,
    addNote,
    splitOrder,
    completePayment,
    checkout,
  };
}
