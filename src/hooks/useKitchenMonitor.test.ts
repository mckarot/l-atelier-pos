// src/hooks/useKitchenMonitor.test.ts
// Tests unitaires pour les hooks useKitchenMonitor

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db } from '../db/database';
import {
  useKitchenOrders,
  useFormattedKitchenOrders,
  useStockAlert,
  useKitchenOrdersCount,
  useRetardOrdersCount,
} from './useKitchenMonitor';
import type { Order } from '../db/types';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'en_preparation',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('useKitchenOrders', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await db.orders.clear();
  });

  describe('Récupération des commandes', () => {
    it('retourne undefined quand il n\'y a pas de commandes', async () => {
      // Arrange - Aucune commande

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
      expect(result.current).toHaveLength(0);
    });

    it('retourne les commandes actives (en_attente, en_preparation, pret)', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'en_attente',
      });
      await db.orders.add({
        ...createOrder(),
        id: 2,
        status: 'en_preparation',
      });
      await db.orders.add({
        ...createOrder(),
        id: 3,
        status: 'pret',
      });
      // Cette commande ne devrait pas être incluse
      await db.orders.add({
        ...createOrder(),
        id: 4,
        status: 'paye',
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(3);
      });
    });

    it('exclut les commandes payées', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paye',
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(0);
      });
    });

    it('exclut les commandes annulées', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'annule',
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('Propriétés des commandes', () => {
    it('inclut l\'ID de la commande', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 123,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].id).toBe(123);
      });
    });

    it('inclut le tableId', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        tableId: 8,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].tableId).toBe(8);
      });
    });

    it('inclut les items avec name et quantity', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        items: [
          { name: 'Burger', quantity: 2 },
          { name: 'Salade', quantity: 1 },
        ],
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].items).toHaveLength(2);
        expect(result.current![0].items[0].name).toBe('Burger');
        expect(result.current![0].items[0].quantity).toBe(2);
      });
    });

    it('calcule elapsedTime en secondes', async () => {
      // Arrange - Commande créée il y a 5 minutes
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        // 5 minutes = 300 secondes (environ)
        expect(result.current![0].elapsedTime).toBeGreaterThanOrEqual(299);
        expect(result.current![0].elapsedTime).toBeLessThanOrEqual(310);
      });
    });

    it('définit le statut "en_preparation" pour les commandes < 20 min', async () => {
      // Arrange - Commande créée il y a 5 minutes
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].status).toBe('en_preparation');
      });
    });

    it('définit le statut "retard" pour les commandes >= 20 min', async () => {
      // Arrange - Commande créée il y a 25 minutes
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].status).toBe('retard');
      });
    });
  });

  describe('Tri des commandes', () => {
    it('trie les commandes avec retard en premier', async () => {
      // Arrange
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;

      // Commande récente
      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      // Commande en retard
      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: twentyFiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(2);
        // La première commande devrait être en retard
        expect(result.current![0].status).toBe('retard');
        expect(result.current![1].status).toBe('en_preparation');
      });
    });

    it('trie les commandes par temps écoulé décroissant', async () => {
      // Arrange
      const tenMinAgo = Date.now() - 10 * 60 * 1000;
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;

      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: fiveMinAgo,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: tenMinAgo,
      });

      // Act
      const { result } = renderHook(() => useKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toHaveLength(2);
        // La commande la plus ancienne devrait être en premier
        expect(result.current![0].elapsedTime).toBeGreaterThan(result.current![1].elapsedTime);
      });
    });
  });
});

describe('useFormattedKitchenOrders', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  describe('Formats d\'affichage', () => {
    it('formate l\'orderId au format #ORD-XXXX', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 123,
      });

      // Act
      const { result } = renderHook(() => useFormattedKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].orderIdDisplay).toBe('#ORD-0123');
      });
    });

    it('formate le tableId au format "Table XX"', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        tableId: 8,
      });

      // Act
      const { result } = renderHook(() => useFormattedKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].tableNameDisplay).toBe('Table 08');
      });
    });

    it('formate le temps au format MM:SS', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
      });

      // Act
      const { result } = renderHook(() => useFormattedKitchenOrders());

      // Assert
      await waitFor(() => {
        expect(result.current![0].timeDisplay).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });
});

describe('useStockAlert', () => {
  beforeEach(async () => {
    await db.menuItems.clear();
  });

  describe('Calcul des alertes', () => {
    it('retourne undefined quand il n\'y a pas d\'articles', async () => {
      // Arrange - Aucun article

      // Act
      const { result } = renderHook(() => useStockAlert());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('compte les articles épuisés (isAvailable = 0)', async () => {
      // Arrange
      await db.menuItems.add({
        id: 1,
        name: 'Item 1',
        description: 'Desc 1',
        price: 10,
        category: 'Entrées',
        isAvailable: 0, // Épuisé
      });
      await db.menuItems.add({
        id: 2,
        name: 'Item 2',
        description: 'Desc 2',
        price: 15,
        category: 'Plats',
        isAvailable: 1,
      });

      // Act
      const { result } = renderHook(() => useStockAlert());

      // Assert
      await waitFor(() => {
        expect(result.current!.depletedCount).toBe(1);
      });
    });

    it('compte les articles en stock faible (prix < 15 comme simulation)', async () => {
      // Arrange
      await db.menuItems.add({
        id: 1,
        name: 'Item 1',
        description: 'Desc 1',
        price: 10, // < 15 = stock faible
        category: 'Entrées',
        isAvailable: 1,
      });
      await db.menuItems.add({
        id: 2,
        name: 'Item 2',
        description: 'Desc 2',
        price: 20, // >= 15 = pas stock faible
        category: 'Plats',
        isAvailable: 1,
      });

      // Act
      const { result } = renderHook(() => useStockAlert());

      // Assert
      await waitFor(() => {
        expect(result.current!.lowStockCount).toBe(1);
      });
    });

    it('retourne 0 pour depletedCount et lowStockCount quand tous les articles sont disponibles', async () => {
      // Arrange
      await db.menuItems.add({
        id: 1,
        name: 'Item 1',
        description: 'Desc 1',
        price: 20,
        category: 'Entrées',
        isAvailable: 1,
      });

      // Act
      const { result } = renderHook(() => useStockAlert());

      // Assert
      await waitFor(() => {
        expect(result.current!.depletedCount).toBe(0);
      });
    });
  });
});

describe('useKitchenOrdersCount', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  it('retourne 0 quand il n\'y a pas de commandes', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useKitchenOrdersCount());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(0);
    });
  });

  it('retourne le nombre de commandes actives', async () => {
    // Arrange
    await db.orders.add({
      ...createOrder(),
      id: 1,
    });
    await db.orders.add({
      ...createOrder(),
      id: 2,
    });
    await db.orders.add({
      ...createOrder(),
      id: 3,
    });

    // Act
    const { result } = renderHook(() => useKitchenOrdersCount());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(3);
    });
  });
});

describe('useRetardOrdersCount', () => {
  beforeEach(async () => {
    await db.orders.clear();
  });

  it('retourne 0 quand il n\'y a pas de commandes en retard', async () => {
    // Arrange
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    await db.orders.add({
      ...createOrder(),
      id: 1,
      createdAt: fiveMinAgo,
    });

    // Act
    const { result } = renderHook(() => useRetardOrdersCount());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(0);
    });
  });

  it('retourne le nombre de commandes en retard', async () => {
    // Arrange
    const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
    await db.orders.add({
      ...createOrder(),
      id: 1,
      createdAt: twentyFiveMinAgo,
    });
    await db.orders.add({
      ...createOrder(),
      id: 2,
      createdAt: twentyFiveMinAgo - 60000, // 1 min plus tôt
    });

    // Act
    const { result } = renderHook(() => useRetardOrdersCount());

    // Assert
    await waitFor(() => {
      expect(result.current).toBe(2);
    });
  });
});

describe('Réactivité', () => {
  beforeEach(async () => {
    await db.orders.clear();
    await db.menuItems.clear();
  });

  it('met à jour les commandes quand une nouvelle commande est ajoutée', async () => {
    // Arrange
    const { result } = renderHook(() => useKitchenOrders());

    await waitFor(() => {
      expect(result.current).toHaveLength(0);
    });

    // Act - Ajouter une commande
    await db.orders.add({
      ...createOrder(),
      id: 1,
    });

    // Assert
    await waitFor(() => {
      expect(result.current).toHaveLength(1);
    });
  });

  it('met à jour l\'alerte stock quand un article est ajouté', async () => {
    // Arrange
    const { result } = renderHook(() => useStockAlert());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const initialDepleted = result.current!.depletedCount;

    // Act - Ajouter un article épuisé
    await db.menuItems.add({
      id: 1,
      name: 'Item 1',
      description: 'Desc 1',
      price: 10,
      category: 'Entrées',
      isAvailable: 0,
    });

    // Assert
    await waitFor(() => {
      expect(result.current!.depletedCount).toBe(initialDepleted + 1);
    });
  });
});
