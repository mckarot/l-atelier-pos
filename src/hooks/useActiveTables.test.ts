// src/hooks/useActiveTables.test.ts
// Tests unitaires pour le hook useActiveTables

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db, seedDatabase } from '../db/database';
import type { Order } from '../db/types';
import {
  useActiveTables,
  useActiveTablesCount,
  useRetardTablesCount,
  type TableService,
} from './useActiveTables';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'en_attente',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('useActiveTables Hook', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('useActiveTables - Données de base', () => {
    it('devrait retourner les tables actives', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('devrait retourner undefined quand les données ne sont pas chargées', () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveTables());

      // Assert - Initialement undefined
      expect(result.current).toBeUndefined();
    });

    it('devrait exclure les commandes payées, servies et annulées', async () => {
      // Arrange - Ajouter des commandes avec différents statuts
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 100,
        tableId: 20,
        status: 'paye',
        createdAt: now,
      });
      await db.orders.add({
        ...createOrder(),
        id: 101,
        tableId: 21,
        status: 'servi',
        createdAt: now,
      });
      await db.orders.add({
        ...createOrder(),
        id: 102,
        tableId: 22,
        status: 'annule',
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const tables = result.current!;
      const orderIds = tables.map(t => t.orderId);
      expect(orderIds).not.toContain(100);
      expect(orderIds).not.toContain(101);
      expect(orderIds).not.toContain(102);
    });
  });

  describe('useActiveTables - Structure des données', () => {
    it('devrait retourner des objets TableService avec toutes les propriétés', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const table = result.current![0];
      expect(table).toHaveProperty('orderId');
      expect(table).toHaveProperty('tableId');
      expect(table).toHaveProperty('tableName');
      expect(table).toHaveProperty('status');
      expect(table).toHaveProperty('guests');
      expect(table).toHaveProperty('server');
      expect(table).toHaveProperty('items');
      expect(table).toHaveProperty('waitTime');
      expect(table).toHaveProperty('total');
    });

    it('devrait formater le nom de la table avec padding (ex: "Table 08")', async () => {
      // Arrange - Ajouter une commande pour la table 8
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 200,
        tableId: 8,
        status: 'en_attente',
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table8 = result.current!.find(t => t.tableId === 8);
      expect(table8?.tableName).toBe('Table 08');
    });

    it('devrait inclure les items de la commande', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current![0];
      expect(table.items).toBeDefined();
      expect(Array.isArray(table.items)).toBe(true);
    });

    it('devrait convertir les items avec le bon statut', async () => {
      // Arrange - Ajouter une commande avec items personnalisés
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 300,
        tableId: 30,
        status: 'en_preparation',
        items: [
          { name: 'Item 1', quantity: 2, customization: 'Bien cuit', station: 'GRILL' },
          { name: 'Item 2', quantity: 1, done: true, station: 'FROID' },
          { name: 'Item 3', quantity: 3, station: 'PATISSERIE' },
        ],
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 300);
      expect(table).toBeDefined();
      expect(table!.items[0].status).toBe('preparation'); // avec customization
      expect(table!.items[1].status).toBe('pret'); // done: true
      expect(table!.items[2].status).toBe('attente'); // sans customization ni done
    });
  });

  describe('useActiveTables - Statut des tables', () => {
    it('devrait marquer une table comme "retard" après 20 minutes', async () => {
      // Arrange - Commander il y a 25 minutes
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 400,
        tableId: 40,
        status: 'en_preparation',
        createdAt: twentyFiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 400);
      expect(table?.status).toBe('retard');
    });

    it('devrait marquer une table comme "nouveau" quand status est en_attente', async () => {
      // Arrange - Commander il y a 5 minutes
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 500,
        tableId: 50,
        status: 'en_attente',
        createdAt: fiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 500);
      expect(table?.status).toBe('nouveau');
    });

    it('devrait marquer une table comme "en_preparation" quand status est en_preparation', async () => {
      // Arrange - Commander il y a 10 minutes
      const tenMinAgo = Date.now() - 10 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 600,
        tableId: 60,
        status: 'en_preparation',
        createdAt: tenMinAgo,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 600);
      expect(table?.status).toBe('en_preparation');
    });
  });

  describe('useActiveTables - Tri et ordonnancement', () => {
    it('devrait trier les tables avec retard en premier', async () => {
      // Arrange - Créer des tables avec différents statuts
      const now = Date.now();
      const twentyFiveMinAgo = now - 25 * 60 * 1000;
      const tenMinAgo = now - 10 * 60 * 1000;

      await db.orders.add({
        ...createOrder(),
        id: 701,
        tableId: 71,
        status: 'en_preparation',
        createdAt: tenMinAgo,
      });
      await db.orders.add({
        ...createOrder(),
        id: 702,
        tableId: 72,
        status: 'en_preparation',
        createdAt: twentyFiveMinAgo, // retard
      });
      await db.orders.add({
        ...createOrder(),
        id: 703,
        tableId: 73,
        status: 'en_attente',
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const tables = result.current!;
      const retardTable = tables.find(t => t.orderId === 702);
      expect(retardTable).toBeDefined();

      // La table en retard devrait être en première position parmi les tables filtrées
      const retardIndex = tables.findIndex(t => t.orderId === 702);
      const prepIndex = tables.findIndex(t => t.orderId === 701);
      const newIndex = tables.findIndex(t => t.orderId === 703);

      expect(retardIndex).toBeLessThan(prepIndex);
      expect(retardIndex).toBeLessThan(newIndex);
    });

    it('devrait trier par temps d\'attente décroissant dans le même statut', async () => {
      // Arrange - Créer des tables avec le même statut mais temps d'attente différent
      const now = Date.now();
      const fifteenMinAgo = now - 15 * 60 * 1000;
      const fiveMinAgo = now - 5 * 60 * 1000;

      await db.orders.add({
        ...createOrder(),
        id: 801,
        tableId: 81,
        status: 'en_preparation',
        createdAt: fiveMinAgo,
      });
      await db.orders.add({
        ...createOrder(),
        id: 802,
        tableId: 82,
        status: 'en_preparation',
        createdAt: fifteenMinAgo,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const tables = result.current!;
      const table15min = tables.find(t => t.orderId === 802);
      const table5min = tables.find(t => t.orderId === 801);

      expect(table15min).toBeDefined();
      expect(table5min).toBeDefined();

      const index15min = tables.findIndex(t => t.orderId === 802);
      const index5min = tables.findIndex(t => t.orderId === 801);

      expect(index15min).toBeLessThan(index5min);
    });
  });

  describe('useActiveTables - Calcul du temps d\'attente', () => {
    it('devrait calculer le temps d\'attente en minutes', async () => {
      // Arrange - Commander il y a 12 minutes
      const twelveMinAgo = Date.now() - 12 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 900,
        tableId: 90,
        status: 'en_preparation',
        createdAt: twelveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 900);
      expect(table?.waitTime).toBeGreaterThanOrEqual(12);
      expect(table?.waitTime).toBeLessThanOrEqual(13); // Petite marge pour le temps d'exécution
    });

    it('devrait avoir un temps d\'attente de 0 pour une commande très récente', async () => {
      // Arrange - Commander maintenant
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 950,
        tableId: 95,
        status: 'en_attente',
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useActiveTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const table = result.current!.find(t => t.orderId === 950);
      expect(table?.waitTime).toBeLessThanOrEqual(1);
    });
  });

  describe('useActiveTablesCount', () => {
    it('devrait retourner le nombre de tables actives', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useActiveTablesCount());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('devrait retourner 0 quand il n\'y a pas de tables actives', async () => {
      // Arrange - Vider les commandes actives
      await db.orders.clear();

      // Act
      const { result } = renderHook(() => useActiveTablesCount());

      // Assert
      await waitFor(() => {
        expect(result.current).toBe(0);
      }, { timeout: 2000 });
    });
  });

  describe('useRetardTablesCount', () => {
    it('devrait retourner le nombre de tables en retard', async () => {
      // Arrange - Ajouter une table en retard
      const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
      await db.orders.add({
        ...createOrder(),
        id: 1000,
        tableId: 100,
        status: 'en_preparation',
        createdAt: twentyFiveMinAgo,
      });

      // Act
      const { result } = renderHook(() => useRetardTablesCount());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('devrait retourner 0 quand il n\'y a pas de tables en retard', async () => {
      // Arrange - Vider les commandes et ajouter une commande récente
      await db.orders.clear();
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 1050,
        tableId: 105,
        status: 'en_attente',
        createdAt: now,
      });

      // Act
      const { result } = renderHook(() => useRetardTablesCount());

      // Assert
      await waitFor(() => {
        expect(result.current).toBe(0);
      }, { timeout: 2000 });
    });
  });

  describe('useActiveTables - Réactivité', () => {
    it('devrait mettre à jour quand une nouvelle commande est ajoutée', async () => {
      // Arrange
      const { result } = renderHook(() => useActiveTables());

      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const initialCount = result.current!.length;

      // Act - Ajouter une nouvelle commande
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 1100,
        tableId: 110,
        status: 'en_attente',
        createdAt: now,
      });

      // Assert
      await waitFor(() => {
        expect(result.current!.length).toBe(initialCount + 1);
      }, { timeout: 2000 });
    });

    it('devrait mettre à jour quand une commande change de statut', async () => {
      // Arrange
      const now = Date.now();
      await db.orders.add({
        ...createOrder(),
        id: 1200,
        tableId: 120,
        status: 'en_attente',
        createdAt: now,
      });

      const { result } = renderHook(() => useActiveTables());

      await waitFor(() => {
        expect(result.current).toBeDefined();
      }, { timeout: 2000 });

      const initialTable = result.current!.find(t => t.orderId === 1200);
      expect(initialTable).toBeDefined();

      // Act - Changer le statut à 'paye' (devrait disparaître)
      await db.orders.update(1200, { status: 'paye' });

      // Assert
      await waitFor(() => {
        const table = result.current!.find(t => t.orderId === 1200);
        expect(table).toBeUndefined();
      }, { timeout: 2000 });
    });
  });
});
