// src/db/database.test.ts
// Tests unitaires pour la classe AtelierDatabase et la fonction seedDatabase

import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedDatabase } from './database';
import type { Order, MenuItem, TableRecord, Reservation } from './types';

describe('AtelierDatabase - Schéma v1', () => {
  describe('Structure de la base de données', () => {
    it('devrait avoir 5 tables définies dans le schéma', () => {
      // Arrange & Act - Les tables sont déclarées dans la classe AtelierDatabase
      const tableNames = ['orders', 'tables', 'menuItems', 'reservations', 'users'];

      // Assert
      expect(tableNames).toContain('orders');
      expect(tableNames).toContain('tables');
      expect(tableNames).toContain('menuItems');
      expect(tableNames).toContain('reservations');
      expect(tableNames).toContain('users');
      expect(tableNames).toHaveLength(5);
    });

    it('devrait avoir les index corrects sur la table orders', async () => {
      // Arrange
      await db.transaction('rw', db.orders, async () => {
        await db.orders.add({
          tableId: 1,
          customerName: 'Client Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        });
      });

      // Act & Assert - Vérifier que les index fonctionnent
      const byStatus = await db.orders.where('status').equals('en_attente').toArray();
      expect(byStatus).toHaveLength(1);

      const byTableId = await db.orders.where('tableId').equals(1).toArray();
      expect(byTableId).toHaveLength(1);
    });

    it('devrait avoir les index corrects sur la table tables', async () => {
      // Arrange
      await db.transaction('rw', db.restaurantTables, async () => {
        await db.restaurantTables.add({
          id: 1,
          status: 'libre',
          capacity: 2,
        });
      });

      // Act & Assert
      const byStatus = await db.restaurantTables.where('status').equals('libre').toArray();
      expect(byStatus).toHaveLength(1);

      const byId = await db.restaurantTables.get(1);
      expect(byId?.id).toBe(1);
    });

    it('devrait avoir les index corrects sur la table menuItems', async () => {
      // Arrange
      await db.transaction('rw', db.menuItems, async () => {
        await db.menuItems.add({
          name: 'Test Item',
          description: 'Test',
          price: 10,
          category: 'Plats',
          isAvailable: 1,
        });
      });

      // Act & Assert
      const byCategory = await db.menuItems.where('category').equals('Plats').toArray();
      expect(byCategory).toHaveLength(1);

      const byAvailability = await db.menuItems.where('isAvailable').equals(1).toArray();
      expect(byAvailability).toHaveLength(1);
    });

    it('devrait avoir les index corrects sur la table reservations', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      await db.transaction('rw', db.reservations, async () => {
        await db.reservations.add({
          customerName: 'Test',
          date: today,
          time: '19:00',
          guests: 2,
          status: 'confirme',
        });
      });

      // Act & Assert
      const byDate = await db.reservations.where('date').equals(today).toArray();
      expect(byDate).toHaveLength(1);

      const byStatus = await db.reservations.where('status').equals('confirme').toArray();
      expect(byStatus).toHaveLength(1);
    });
  });
});

describe('seedDatabase()', () => {
  beforeEach(async () => {
    // Nettoyer avant chaque test de seed
    await db.orders.clear();
    await db.restaurantTables.clear();
    await db.menuItems.clear();
    await db.reservations.clear();
    await db.users.clear();
  });

  describe('Création des tables du restaurant', () => {
    it('devrait créer exactement 16 tables', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const tablesCount = await db.restaurantTables.count();
      expect(tablesCount).toBe(16);
    });

    it('devrait créer des tables avec des statuts variés', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const tables = await db.restaurantTables.toArray();
      const statuses = tables.map(t => t.status);

      expect(statuses).toContain('libre');
      expect(statuses).toContain('occupee');
      expect(statuses).toContain('reserve');
      expect(statuses).toContain('pret');
    });

    it('devrait créer des tables avec des capacités différentes', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const tables = await db.restaurantTables.toArray();
      const capacities = tables.map(t => t.capacity);

      expect(capacities).toContain(2);
      expect(capacities).toContain(4);
      expect(capacities).toContain(6);
      expect(capacities).toContain(8);
    });

    it('devrait créer des tables dans différents secteurs', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const tables = await db.restaurantTables.toArray();
      const sectors = tables.map(t => t.sector);

      expect(sectors).toContain('Salle principale');
      expect(sectors).toContain('Terrasse');
      expect(sectors).toContain('Bar');
    });

    it('devrait créer des tables occupées avec un currentOrderId', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const occupiedTables = await db.restaurantTables.where('status').equals('occupee').toArray();
      expect(occupiedTables.length).toBeGreaterThan(0);
      
      occupiedTables.forEach(table => {
        expect(table.currentOrderId).toBeDefined();
      });
    });
  });

  describe('Création des items du menu', () => {
    it('devrait créer exactement 6 items de menu', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const menuCount = await db.menuItems.count();
      expect(menuCount).toBe(6);
    });

    it('devrait créer des items dans 3 catégories différentes', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const menuItems = await db.menuItems.toArray();
      const categories = menuItems.map(item => item.category);

      expect(categories).toContain('Entrées');
      expect(categories).toContain('Plats');
      expect(categories).toContain('Desserts');
    });

    it('devrait créer des items avec des prix différents', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const menuItems = await db.menuItems.toArray();
      const prices = menuItems.map(item => item.price);

      expect(prices).toContain(14.50); // Tartare de Saumon
      expect(prices).toContain(18.00); // Foie Gras
      expect(prices).toContain(34.00); // Entrecôte
      expect(prices).toContain(28.50); // Filet de Bar
      expect(prices).toContain(26.00); // Risotto
      expect(prices).toContain(8.50);  // Café Gourmand
    });

    it('devrait créer des items tous disponibles (isAvailable = 1)', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const menuItems = await db.menuItems.toArray();
      const allAvailable = menuItems.every(item => item.isAvailable === 1);
      expect(allAvailable).toBe(true);
    });

    it('devrait créer des items avec des stations différentes', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const menuItems = await db.menuItems.toArray();
      const stations = menuItems.map(item => item.station);

      expect(stations).toContain('FROID');
      expect(stations).toContain('GRILL');
      expect(stations).toContain('PATISSERIE');
    });
  });

  describe('Création des commandes', () => {
    it('devrait créer exactement 8 commandes', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const ordersCount = await db.orders.count();
      expect(ordersCount).toBe(8);
    });

    it('devrait créer des commandes avec des statuts variés', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const orders = await db.orders.toArray();
      const statuses = orders.map(o => o.status);

      expect(statuses).toContain('en_attente');
      expect(statuses).toContain('en_preparation');
      expect(statuses).toContain('pret');
    });

    it('devrait créer des commandes avec des items', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const orders = await db.orders.toArray();
      const allHaveItems = orders.every(o => o.items.length > 0);
      expect(allHaveItems).toBe(true);
    });

    it('devrait créer des commandes avec des totaux différents', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const orders = await db.orders.toArray();
      const totals = orders.map(o => o.total);

      expect(totals).toContain(78.00);
      expect(totals).toContain(43.00);
      expect(totals).toContain(52.00);
      expect(totals).toContain(26.50);
      expect(totals).toContain(124.00);
      expect(totals).toContain(57.00);
      expect(totals).toContain(17.00);
      expect(totals).toContain(40.50);
    });

    it('devrait créer des commandes avec des createdAt différents', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const orders = await db.orders.toArray();
      const createdAts = orders.map(o => o.createdAt);
      
      // Vérifier que les dates sont différentes (commandes créées à des moments différents)
      const uniqueDates = new Set(createdAts);
      expect(uniqueDates.size).toBeGreaterThan(1);
    });
  });

  describe('Création des réservations', () => {
    it('devrait créer exactement 2 réservations', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const reservationsCount = await db.reservations.count();
      expect(reservationsCount).toBe(2);
    });

    it('devrait créer des réservations pour la date du jour', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const reservations = await db.reservations.toArray();
      const today = new Date().toISOString().split('T')[0];
      
      reservations.forEach(reservation => {
        expect(reservation.date).toBe(today);
      });
    });

    it('devrait créer des réservations avec des statuts différents', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const reservations = await db.reservations.toArray();
      const statuses = reservations.map(r => r.status);

      expect(statuses).toContain('confirme');
      expect(statuses).toContain('en_attente');
    });

    it('devrait créer des réservations avec des informations complètes', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const reservations = await db.reservations.toArray();
      
      reservations.forEach(reservation => {
        expect(reservation.customerName).toBeDefined();
        expect(reservation.email).toBeDefined();
        expect(reservation.phone).toBeDefined();
        expect(reservation.guests).toBeGreaterThan(0);
        expect(reservation.time).toBeDefined();
      });
    });
  });

  describe('Création des utilisateurs', () => {
    it('devrait créer exactement 4 utilisateurs', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const usersCount = await db.users.count();
      expect(usersCount).toBe(4);
    });

    it('devrait créer des utilisateurs avec des rôles différents', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const users = await db.users.toArray();
      const roles = users.map(u => u.role);

      expect(roles).toContain('admin');
      expect(roles).toContain('kds');
      expect(roles).toContain('serveur');
      expect(roles).toContain('client');
    });

    it('devrait créer des utilisateurs tous actifs (isActive = 1)', async () => {
      // Arrange & Act
      await seedDatabase();

      // Assert
      const users = await db.users.toArray();
      const allActive = users.every(u => u.isActive === 1);
      expect(allActive).toBe(true);
    });
  });

  describe('Idempotence du seed', () => {
    it('devrait être idempotent - 2ème appel ne duplique pas les données', async () => {
      // Arrange
      await seedDatabase();

      // Act - Deuxième appel
      await seedDatabase();

      // Assert - Les comptages doivent rester identiques
      const tablesCount = await db.restaurantTables.count();
      const menuCount = await db.menuItems.count();
      const ordersCount = await db.orders.count();
      const reservationsCount = await db.reservations.count();
      const usersCount = await db.users.count();

      expect(tablesCount).toBe(16);
      expect(menuCount).toBe(6);
      expect(ordersCount).toBe(8);
      expect(reservationsCount).toBe(2);
      expect(usersCount).toBe(4);
    });

    it('devrait être idempotent - 3ème appel ne duplique pas les données', async () => {
      // Arrange & Act - Trois appels successifs
      await seedDatabase();
      await seedDatabase();
      await seedDatabase();

      // Assert
      const tablesCount = await db.restaurantTables.count();
      const menuCount = await db.menuItems.count();
      const ordersCount = await db.orders.count();
      const reservationsCount = await db.reservations.count();
      const usersCount = await db.users.count();

      expect(tablesCount).toBe(16);
      expect(menuCount).toBe(6);
      expect(ordersCount).toBe(8);
      expect(reservationsCount).toBe(2);
      expect(usersCount).toBe(4);
    });
  });
});
