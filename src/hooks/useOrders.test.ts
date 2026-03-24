// src/hooks/useOrders.test.ts
// Tests unitaires pour les hooks de gestion des commandes

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { seedDatabase } from '../db/database';
import { db } from '../db/database';
import type { Order } from '../db/types';

// Import des hooks à tester
import {
  useActiveOrders,
  useOrdersByTable,
  useOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  useOrdersByStatus,
} from './useOrders';

describe('useOrders Hooks', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('useActiveOrders', () => {
    it('devrait retourner toutes les commandes actives (non payées et non annulées)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.length).toBeGreaterThan(0);
      });

      // Vérifier que toutes les commandes retournées sont actives
      const orders = result.current!;
      const activeStatuses = ['attente', 'preparation', 'pret', 'served'];
      orders.forEach(order => {
        expect(activeStatuses).toContain(order.status);
      });
    });

    it('devrait retourner les commandes triées par createdAt croissant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i - 1].createdAt).toBeLessThanOrEqual(orders[i].createdAt);
      }
    });

    it('devrait retourner undefined quand il n\'y a pas de commandes', async () => {
      // Arrange - Vider les commandes
      await db.orders.clear();

      // Act
      const { result } = renderHook(() => useActiveOrders());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });
  });

  describe('useOrdersByTable', () => {
    it('devrait retourner toutes les commandes d\'une table spécifique', async () => {
      // Arrange & Act - Table 2 a des commandes dans le seed
      const { result } = renderHook(() => useOrdersByTable(2));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach(order => {
        expect(order.tableId).toBe(2);
      });
    });

    it('devrait retourner un tableau vide pour une table sans commandes', async () => {
      // Arrange & Act - Table 3 n'a pas de commandes dans le seed
      const { result } = renderHook(() => useOrdersByTable(3));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });

    it('devrait retourner les commandes triées par createdAt', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByTable(4));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      // Le hook inverse le tri, donc on vérifie l'ordre décroissant
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i - 1].createdAt).toBeGreaterThanOrEqual(orders[i].createdAt);
      }
    });
  });

  describe('useOrder', () => {
    it('devrait retourner une commande par son ID', async () => {
      // Arrange - Récupérer une commande existante
      const existingOrder = await db.orders.orderBy("id").first();
      expect(existingOrder).toBeDefined();

      // Act
      const { result } = renderHook(() => useOrder(existingOrder!.id));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.id).toBe(existingOrder!.id);
      expect(result.current!.tableId).toBe(existingOrder!.tableId);
    });

    it('devrait retourner undefined pour un ID inexistant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrder(99999));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });
  });

  describe('createOrder', () => {
    it('devrait créer une nouvelle commande avec succès', async () => {
      // Arrange
      const newOrderData = {
        tableId: 5,
        customerName: 'Client Test',
        status: 'attente' as const,
        items: [{ name: 'Nouveau Item', quantity: 2 }],
        total: 25.00,
      };

      // Act
      const orderId = await createOrder(newOrderData);

      // Assert
      expect(orderId).toBeDefined();
      expect(typeof orderId).toBe('number');

      const createdOrder = await db.orders.get(orderId);
      expect(createdOrder).toBeDefined();
      expect(createdOrder!.tableId).toBe(5);
      expect(createdOrder!.status).toBe('attente');
      expect(createdOrder!.items).toHaveLength(1);
      expect(createdOrder!.items[0].name).toBe('Nouveau Item');
      expect(createdOrder!.total).toBe(25.00);
      expect(createdOrder!.createdAt).toBeDefined();
    });

    it('devrait créer une commande avec des items multiples', async () => {
      // Arrange
      const newOrderData = {
        tableId: 7,
        customerName: 'Client Test',
        status: 'attente' as const,
        items: [
          { name: 'Item 1', quantity: 1, station: 'GRILL' as const },
          { name: 'Item 2', quantity: 2, station: 'FROID' as const },
        ],
        total: 45.00,
      };

      // Act
      const orderId = await createOrder(newOrderData);

      // Assert
      const createdOrder = await db.orders.get(orderId);
      expect(createdOrder!.items).toHaveLength(2);
      expect(createdOrder!.items[0].station).toBe('GRILL');
      expect(createdOrder!.items[1].station).toBe('FROID');
    });

    it('devrait créer une commande avec des notes', async () => {
      // Arrange
      const newOrderData = {
        tableId: 9,
        customerName: 'Client Test',
        status: 'attente' as const,
        items: [{ name: 'Test', quantity: 1 }],
        total: 15.00,
        notes: 'Allergie aux arachides',
      };

      // Act
      const orderId = await createOrder(newOrderData);

      // Assert
      const createdOrder = await db.orders.get(orderId);
      expect(createdOrder!.notes).toBe('Allergie aux arachides');
    });

    it('devrait initialiser createdAt automatiquement', async () => {
      // Arrange
      const beforeCreate = Date.now();

      // Act
      const orderId = await createOrder({
        tableId: 10,
        customerName: 'Client Test',
        status: 'attente' as const,
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Assert
      const createdOrder = await db.orders.get(orderId);
      expect(createdOrder!.createdAt).toBeGreaterThanOrEqual(beforeCreate);
      expect(createdOrder!.createdAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('updateOrderStatus', () => {
    it('devrait mettre à jour le statut d\'une commande', async () => {
      // Arrange - Créer une commande
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Act
      await updateOrderStatus({ id: orderId, status: 'preparation' });

      // Assert
      const updatedOrder = await db.orders.get(orderId);
      expect(updatedOrder!.status).toBe('preparation');
      expect(updatedOrder!.updatedAt).toBeDefined();
    });

    it('devrait mettre à jour updatedAt automatiquement', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      const beforeUpdate = Date.now();

      // Act
      await updateOrderStatus({ id: orderId, status: 'pret' });

      // Assert
      const updatedOrder = await db.orders.get(orderId);
      expect(updatedOrder!.updatedAt).toBeDefined();
      expect(updatedOrder!.updatedAt!).toBeGreaterThanOrEqual(beforeUpdate);
    });

    it('devrait initialiser servedAt quand le statut passe à "servi"', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Act - Passer directement à 'served'
      await updateOrderStatus({ id: orderId, status: 'served' });

      // Assert
      const updatedOrder = await db.orders.get(orderId);
      expect(updatedOrder!.status).toBe('served');
      expect(updatedOrder!.servedAt).toBeDefined();
    });

    it('ne devrait pas modifier servedAt si le statut n\'est pas "servi"', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Act
      await updateOrderStatus({ id: orderId, status: 'preparation' });

      // Assert
      const updatedOrder = await db.orders.get(orderId);
      expect(updatedOrder!.servedAt).toBeUndefined();
    });

    it('devrait lancer une erreur si la commande n\'existe pas', async () => {
      // Arrange & Act & Assert
      await expect(
        updateOrderStatus({ id: 99999, status: 'pret' })
      ).rejects.toThrow('[updateOrderStatus] Commande 99999 introuvable');
    });
  });

  describe('cancelOrder', () => {
    it('devrait annuler une commande en changeant le statut', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Act
      await cancelOrder(orderId);

      // Assert
      const cancelledOrder = await db.orders.get(orderId);
      expect(cancelledOrder!.status).toBe('annule');
    });

    it('devrait mettre à jour updatedAt lors de l\'annulation', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'attente',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      const beforeCancel = Date.now();

      // Act
      await cancelOrder(orderId);

      // Assert
      const cancelledOrder = await db.orders.get(orderId);
      expect(cancelledOrder!.updatedAt).toBeDefined();
      expect(cancelledOrder!.updatedAt!).toBeGreaterThanOrEqual(beforeCancel);
    });

    it('devrait pouvoir annuler une commande déjà en préparation', async () => {
      // Arrange
      const orderId = await createOrder({
        tableId: 1,
        customerName: 'Client Test',
        status: 'preparation',
        items: [{ name: 'Test', quantity: 1 }],
        total: 10.00,
      });

      // Act
      await cancelOrder(orderId);

      // Assert
      const cancelledOrder = await db.orders.get(orderId);
      expect(cancelledOrder!.status).toBe('annule');
    });
  });

  describe('useOrdersByStatus', () => {
    it('devrait retourner les commandes avec le statut "en_attente"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByStatus('attente'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach(order => {
        expect(order.status).toBe('attente');
      });
    });

    it('devrait retourner les commandes avec le statut "en_preparation"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByStatus('preparation'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      orders.forEach(order => {
        expect(order.status).toBe('preparation');
      });
    });

    it('devrait retourner les commandes avec le statut "pret"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByStatus('pret'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      orders.forEach(order => {
        expect(order.status).toBe('pret');
      });
    });

    it('devrait retourner un tableau vide pour un statut sans commandes', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByStatus('served'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });

    it('devrait retourner les commandes triées par createdAt', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOrdersByStatus('attente'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const orders = result.current!;
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i - 1].createdAt).toBeGreaterThanOrEqual(orders[i].createdAt);
      }
    });
  });
});
