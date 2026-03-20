// src/hooks/useOrders.ts
// Hooks Dexie pour la gestion des commandes

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Order, OrderStatus, CreateOrderInput, UpdateOrderInput } from '../db/types';

/**
 * Récupère toutes les commandes actives (non payées et non annulées)
 * Utilise l'index `status` pour filtrer efficacement
 * @returns Observable des commandes actives triées par createdAt décroissant
 */
export function useActiveOrders(): Order[] | undefined {
  return useLiveQuery(
    () => db.orders
      .where('status')
      .anyOf(['en_attente', 'en_preparation', 'pret', 'servi'])
      .sortBy('createdAt'),
    []
  );
}

/**
 * Récupère toutes les commandes d'une table spécifique
 * Utilise l'index `tableId` pour une recherche O(log n)
 * @param tableId - Numéro de la table
 * @returns Observable des commandes de la table
 */
export function useOrdersByTable(tableId: number): Order[] | undefined {
  return useLiveQuery(
    () => db.orders
      .where('tableId')
      .equals(tableId)
      .sortBy('createdAt')
      .then(results => results.reverse()),
    [tableId]
  );
}

/**
 * Récupère une commande par son ID
 * @param orderId - ID de la commande
 * @returns La commande ou undefined
 */
export function useOrder(orderId: number): Order | undefined {
  return useLiveQuery(
    () => db.orders.get(orderId),
    [orderId]
  );
}

/**
 * Crée une nouvelle commande en base
 * Utilise l'index `createdAt` pour le tri chronologique
 * @param input - Données de création (sans id, createdAt, updatedAt)
 * @returns ID de la commande créée
 */
export async function createOrder(input: CreateOrderInput): Promise<number> {
  const orderData: Omit<Order, 'id'> = {
    ...input,
    createdAt: Date.now(),
    updatedAt: undefined,
    servedAt: undefined,
  };

  const id = await db.orders.add(orderData as Order);
  return id;
}

/**
 * Met à jour une commande existante
 * Met à jour automatiquement `updatedAt` et `servedAt` si le statut passe à 'servi'
 * @param input - Données de mise à jour (doit inclure id)
 */
export async function updateOrderStatus(input: UpdateOrderInput): Promise<void> {
  const { id, ...updates } = input;

  // Récupère la commande existante pour préserver createdAt
  const existing = await db.orders.get(id);
  if (!existing) {
    throw new Error(`[updateOrderStatus] Commande ${id} introuvable`);
  }

  const updatedData: Partial<Order> = {
    ...updates,
    updatedAt: Date.now(),
  };

  // Si le statut passe à 'servi', on enregistre l'heure de service
  if (updates.status === 'servi' && existing.status !== 'servi') {
    updatedData.servedAt = Date.now();
  }

  await db.orders.update(id, updatedData);
}

/**
 * Supprime une commande (soft delete via statut 'annule')
 * @param orderId - ID de la commande à annuler
 */
export async function cancelOrder(orderId: number): Promise<void> {
  await db.orders.update(orderId, {
    status: 'annule',
    updatedAt: Date.now(),
  });
}

/**
 * Récupère les commandes par statut
 * Utilise l'index `status` pour un filtrage optimisé
 * @param status - Statut à filtrer
 * @returns Observable des commandes avec ce statut
 */
export function useOrdersByStatus(status: OrderStatus): Order[] | undefined {
  return useLiveQuery(
    () => db.orders
      .where('status')
      .equals(status)
      .sortBy('createdAt')
      .then(results => results.reverse()),
    [status]
  );
}
