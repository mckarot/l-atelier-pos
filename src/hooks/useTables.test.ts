// src/hooks/useTables.test.ts
// Tests unitaires pour les hooks de gestion des tables

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { seedDatabase } from '../db/database';
import { db } from '../db/database';
import type { TableRecord } from '../db/types';

// Import des hooks à tester
import {
  useAllTables,
  useTable,
  useTablesByStatus,
  createTable,
  updateTableStatus,
  useAvailableTables,
  useOccupiedTables,
} from './useTables';

describe('useTables Hooks', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('useAllTables', () => {
    it('devrait retourner toutes les 16 tables créées par le seed', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(16);
      });
    });

    it('devrait retourner les tables triées par id', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      for (let i = 1; i < tables.length; i++) {
        expect(tables[i].id).toBeGreaterThan(tables[i - 1].id);
      }
    });

    it('devrait retourner un tableau vide quand il n\'y a pas de tables', async () => {
      // Arrange - Vider les tables
      await db.restaurantTables.clear();

      // Act
      const { result } = renderHook(() => useAllTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('useTable', () => {
    it('devrait retourner une table spécifique par son ID', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTable(1));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.id).toBe(1);
      expect(result.current!.status).toBeDefined();
    });

    it('devrait retourner les bonnes informations pour la table 6 (réservée)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTable(6));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.id).toBe(6);
      expect(result.current!.status).toBe('reservation');
      expect(result.current!.capacity).toBe(6);
    });

    it('devrait retourner undefined pour un ID inexistant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTable(999));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });
  });

  describe('useTablesByStatus', () => {
    it('devrait retourner les tables avec le statut "libre"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTablesByStatus('libre'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('libre');
      });
    });

    it('devrait retourner les tables avec le statut "occupee"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTablesByStatus('occupee'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('occupee');
      });
    });

    it('devrait retourner les tables avec le statut "reserve"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTablesByStatus('reservation'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('reservation');
      });
    });

    it('devrait retourner les tables avec le statut "pret"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTablesByStatus('pret'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('pret');
      });
    });

    it('devrait retourner un tableau vide pour un statut sans tables', async () => {
      // Arrange - S'assurer qu'il n'y a pas de tables avec un statut spécifique
      // Dans le seed, tous les statuts ont des tables, donc on teste avec un statut inexistant
      // En créant une nouvelle table avec un statut unique
      await db.restaurantTables.clear();
      await db.restaurantTables.add({ id: 1, status: 'libre', capacity: 2 });

      // Act
      const { result } = renderHook(() => useTablesByStatus('occupee'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('createTable', () => {
    it('devrait créer une nouvelle table avec succès', async () => {
      // Arrange
      const newTableData = {
        id: 100,
        status: 'libre' as const,
        capacity: 4,
        sector: 'Salle principale',
      };

      // Act
      const tableId = await createTable(newTableData);

      // Assert
      expect(tableId).toBe(100);

      const createdTable = await db.restaurantTables.get(100);
      expect(createdTable).toBeDefined();
      expect(createdTable!.status).toBe('libre');
      expect(createdTable!.capacity).toBe(4);
      expect(createdTable!.sector).toBe('Salle principale');
    });

    it('devrait créer une table sans capacity ni sector', async () => {
      // Arrange
      const newTableData = {
        id: 101,
        status: 'libre' as const,
      };

      // Act
      const tableId = await createTable(newTableData);

      // Assert
      const createdTable = await db.restaurantTables.get(101);
      expect(createdTable).toBeDefined();
      expect(createdTable!.id).toBe(101);
      expect(createdTable!.status).toBe('libre');
    });

    it('devrait créer une table avec currentOrderId', async () => {
      // Arrange
      const newTableData = {
        id: 102,
        status: 'occupee' as const,
        capacity: 2,
        currentOrderId: 999,
      };

      // Act
      const tableId = await createTable(newTableData);

      // Assert
      const createdTable = await db.restaurantTables.get(102);
      expect(createdTable!.currentOrderId).toBe(999);
    });
  });

  describe('updateTableStatus', () => {
    it('devrait changer le statut d\'une table de "libre" à "occupee"', async () => {
      // Arrange - S'assurer que la table 1 est libre
      await db.restaurantTables.update(1, { status: 'libre' });

      // Act
      await updateTableStatus(1, 'occupee');

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('occupee');
    });

    it('devrait changer le statut d\'une table de "occupee" à "pret"', async () => {
      // Arrange
      await db.restaurantTables.update(1, { status: 'occupee' });

      // Act
      await updateTableStatus(1, 'pret');

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('pret');
    });

    it('devrait changer le statut d\'une table de "pret" à "libre"', async () => {
      // Arrange
      await db.restaurantTables.update(1, { status: 'pret' });

      // Act
      await updateTableStatus(1, 'libre');

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('libre');
    });

    it('devrait mettre à jour currentOrderId quand fourni', async () => {
      // Arrange
      await db.restaurantTables.update(1, { status: 'libre', currentOrderId: undefined });

      // Act
      await updateTableStatus(1, 'occupee', 123);

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('occupee');
      expect(updatedTable!.currentOrderId).toBe(123);
    });

    it('devrait retirer currentOrderId quand le statut passe à "libre"', async () => {
      // Arrange
      await db.restaurantTables.update(1, { status: 'occupee', currentOrderId: 456 });

      // Act
      await updateTableStatus(1, 'libre');

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('libre');
      expect(updatedTable!.currentOrderId).toBeUndefined();
    });

    it('devrait conserver currentOrderId si le statut change mais reste occupé', async () => {
      // Arrange
      await db.restaurantTables.update(1, { status: 'occupee', currentOrderId: 789 });

      // Act
      await updateTableStatus(1, 'pret');

      // Assert
      const updatedTable = await db.restaurantTables.get(1);
      expect(updatedTable!.status).toBe('pret');
      expect(updatedTable!.currentOrderId).toBe(789);
    });
  });

  describe('useAvailableTables', () => {
    it('devrait retourner uniquement les tables libres', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAvailableTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('libre');
      });
    });

    it('devrait retourner un sous-ensemble de useAllTables', async () => {
      // Arrange & Act
      const { result: allResult } = renderHook(() => useAllTables());
      const { result: availableResult } = renderHook(() => useAvailableTables());

      // Assert
      await waitFor(() => {
        expect(allResult.current).toBeDefined();
        expect(availableResult.current).toBeDefined();
      });

      expect(availableResult.current!.length).toBeLessThanOrEqual(allResult.current!.length);
    });
  });

  describe('useOccupiedTables', () => {
    it('devrait retourner uniquement les tables occupées', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOccupiedTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.status).toBe('occupee');
      });
    });

    it('devrait retourner des tables avec currentOrderId défini', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useOccupiedTables());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const tables = result.current!;
      tables.forEach(table => {
        expect(table.currentOrderId).toBeDefined();
      });
    });
  });
});
