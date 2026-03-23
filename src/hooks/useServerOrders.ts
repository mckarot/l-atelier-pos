// src/hooks/useServerOrders.ts
// Hook pour gérer les commandes serveur

import { useCallback } from 'react';
import { db } from '../db/database';
import type { Order, OrderItem } from '../db/types';

export function useServerOrders() {
  /**
   * Mettre à jour la quantité d'un item dans une commande
   * Utilise l'index de l'item comme identifiant (car les items en DB n'ont pas d'ID natif)
   */
  const updateItemQuantity = useCallback(async (
    orderId: number,
    itemIndex: number,
    delta: number
  ): Promise<void> => {
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
  }, []);

  /**
   * Mettre à jour les notes d'une commande (remplace les notes existantes)
   * Utilisé par FloorPlanView pour le modal de notes
   */
  const updateOrderNotes = useCallback(async (
    orderId: number,
    notes: string
  ): Promise<void> => {
    await db.orders.update(orderId, {
      notes: notes || undefined,
    });
  }, []);

  /**
   * Ajouter une note à une commande (append)
   * Alternative : ajoute une note à la suite des existantes
   */
  const addNote = useCallback(async (
    orderId: number,
    note: string
  ): Promise<void> => {
    const order = await db.orders.get(orderId);
    if (!order) return;

    const notes = order.notes ? `${order.notes}\n${note}` : note;

    await db.orders.update(orderId, {
      notes,
    });
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
    const order = await db.orders.get(orderId);
    if (!order) return;

    if (splitType === 'equal') {
      // Division équitable : 50% du total sur chaque commande
      const halfTotal = (order.total || 0) / 2;
      const halfItems = Math.ceil(order.items.length / 2);

      const items1 = order.items.slice(0, halfItems);
      const items2 = order.items.slice(halfItems);

      // Créer la nouvelle commande avec la moitié des items
      // Note: db.orders.add() n'a pas besoin de l'ID (auto-incrémenté)
      await db.orders.add({
        tableId,
        status: 'en_attente',
        items: items2 as OrderItem[],
        total: halfTotal,
        createdAt: Date.now(),
        customerName: order.customerName || 'Commande',
      } as Order);

      // Mettre à jour la commande originale
      await db.orders.update(orderId, {
        items: items1 as OrderItem[],
        total: halfTotal,
      });
    } else {
      // Division par items sélectionnés
      const itemsToTransfer = itemIndices.map((i) => order.items[i]).filter(Boolean);
      const itemsToKeep = order.items.filter((_, i) => !itemIndices.includes(i));

      // Calculer les totaux
      const calcTotal = (items: OrderItem[]) =>
        items.reduce((sum, item) => {
          const supplementPrice = item.supplements?.reduce((acc, s) => acc + s.price, 0) || 0;
          return sum + ((item.price || 0) + supplementPrice) * item.quantity;
        }, 0);

      const totalTransfer = calcTotal(itemsToTransfer as OrderItem[]);
      const totalKeep = calcTotal(itemsToKeep as OrderItem[]);

      // Créer la nouvelle commande
      await db.orders.add({
        tableId,
        status: 'en_attente',
        items: itemsToTransfer as OrderItem[],
        total: totalTransfer,
        createdAt: Date.now(),
        customerName: order.customerName || 'Commande',
      } as Order);

      // Mettre à jour la commande originale
      await db.orders.update(orderId, {
        items: itemsToKeep as OrderItem[],
        total: totalKeep,
      });
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
  }, []);

  /**
   * Payer une commande (alias pour completePayment)
   */
  const checkout = useCallback(async (
    orderId: number,
    tableId: number,
    paymentMethod: 'especes' | 'cb' | 'none'
  ): Promise<void> => {
    await completePayment(orderId, tableId, paymentMethod);
  }, [completePayment]);

  return {
    updateItemQuantity,
    updateOrderNotes,
    addNote,
    splitOrder,
    completePayment,
    checkout,
  };
}
