// e2e/database-seed.spec.ts
// Tests E2E pour vérifier que le seed de la base de données fonctionne correctement

import { test, expect } from '@playwright/test';

test.describe('Database Seed - E2E', () => {
  // Seed des données avant chaque test via page.evaluate()
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Vérification des tables du restaurant', () => {
    test('devrait avoir 16 tables créées dans la base de données', async ({ page }) => {
      // Arrange - Seed via evaluate avant navigation
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      // Act - Naviguer et vérifier via DevTools
      await page.goto('/');

      // Assert - Vérifier le nombre de tables via IndexedDB
      const tablesCount = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.restaurantTables.count();
      });

      expect(tablesCount).toBe(16);
    });

    test('devrait avoir des tables avec différents statuts', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert - Vérifier les statuts
      const tableStatuses = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const tables = await db.restaurantTables.toArray();
        return tables.map(t => t.status);
      });

      expect(tableStatuses).toContain('libre');
      expect(tableStatuses).toContain('occupee');
      expect(tableStatuses).toContain('reserve');
      expect(tableStatuses).toContain('pret');
    });

    test('devrait avoir des tables occupées avec un currentOrderId', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const occupiedTables = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.restaurantTables.where('status').equals('occupee').toArray();
      });

      expect(occupiedTables.length).toBeGreaterThan(0);
      occupiedTables.forEach(table => {
        expect(table.currentOrderId).toBeDefined();
      });
    });
  });

  test.describe('Vérification des items du menu', () => {
    test('devrait avoir 6 items de menu créés', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const menuCount = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.menuItems.count();
      });

      expect(menuCount).toBe(6);
    });

    test('devrait avoir des items dans 3 catégories différentes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const categories = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const items = await db.menuItems.toArray();
        return [...new Set(items.map(item => item.category))];
      });

      expect(categories).toContain('Entrées');
      expect(categories).toContain('Plats');
      expect(categories).toContain('Desserts');
    });

    test('devrait avoir tous les items disponibles (isAvailable = 1)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const allAvailable = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const items = await db.menuItems.toArray();
        return items.every(item => item.isAvailable === 1);
      });

      expect(allAvailable).toBe(true);
    });

    test('devrait avoir le "Tartare de Saumon" dans les Entrées', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const tartare = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.menuItems.where('name').equals('Tartare de Saumon').first();
      });

      expect(tartare).toBeDefined();
      expect(tartare!.category).toBe('Entrées');
      expect(tartare!.price).toBe(14.50);
    });
  });

  test.describe('Vérification des commandes', () => {
    test('devrait avoir 8 commandes créées', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const ordersCount = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.orders.count();
      });

      expect(ordersCount).toBe(8);
    });

    test('devrait avoir des commandes avec des statuts variés', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const statuses = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const orders = await db.orders.toArray();
        return [...new Set(orders.map(o => o.status))];
      });

      expect(statuses).toContain('en_attente');
      expect(statuses).toContain('en_preparation');
      expect(statuses).toContain('pret');
    });

    test('devrait avoir des commandes avec des items', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const allHaveItems = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const orders = await db.orders.toArray();
        return orders.every(o => o.items.length > 0);
      });

      expect(allHaveItems).toBe(true);
    });

    test('devrait avoir la commande de la table 2 avec 2 items', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const orderTable2 = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.orders.where('tableId').equals(2).first();
      });

      expect(orderTable2).toBeDefined();
      expect(orderTable2!.items.length).toBe(2);
      expect(orderTable2!.total).toBe(78.00);
    });
  });

  test.describe('Vérification des réservations', () => {
    test('devrait avoir 2 réservations créées', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const reservationsCount = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.reservations.count();
      });

      expect(reservationsCount).toBe(2);
    });

    test('devrait avoir des réservations pour la date du jour', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const today = new Date().toISOString().split('T')[0];
      const reservations = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.reservations.toArray();
      });

      reservations.forEach(reservation => {
        expect(reservation.date).toBe(today);
      });
    });

    test('devrait avoir la réservation "Famille Martin" pour 4 personnes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const martinReservation = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.reservations
          .where('customerName')
          .equals('Famille Martin')
          .first();
      });

      expect(martinReservation).toBeDefined();
      expect(martinReservation!.guests).toBe(4);
      expect(martinReservation!.status).toBe('confirme');
    });

    test('devrait avoir des réservations avec des statuts différents', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const statuses = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const reservations = await db.reservations.toArray();
        return [...new Set(reservations.map(r => r.status))];
      });

      expect(statuses).toContain('confirme');
      expect(statuses).toContain('en_attente');
    });
  });

  test.describe('Vérification des utilisateurs', () => {
    test('devrait avoir 4 utilisateurs créés', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const usersCount = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.users.count();
      });

      expect(usersCount).toBe(4);
    });

    test('devrait avoir des utilisateurs avec des rôles différents', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const roles = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const users = await db.users.toArray();
        return [...new Set(users.map(u => u.role))];
      });

      expect(roles).toContain('admin');
      expect(roles).toContain('kds');
      expect(roles).toContain('serveur');
      expect(roles).toContain('client');
    });

    test('devrait avoir l\'utilisateur admin avec email admin@latelier.pos', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Act & Assert
      const adminUser = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return await db.users.where('email').equals('admin@latelier.pos').first();
      });

      expect(adminUser).toBeDefined();
      expect(adminUser!.role).toBe('admin');
      expect(adminUser!.isActive).toBe(1);
    });
  });

  test.describe('Idempotence du seed', () => {
    test('devrait être idempotent - 2ème appel ne duplique pas les données', async ({ page }) => {
      // Arrange - Premier seed
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      // Act - Deuxième seed
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/');

      // Assert - Vérifier les comptages
      const counts = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return {
          tables: await db.restaurantTables.count(),
          menuItems: await db.menuItems.count(),
          orders: await db.orders.count(),
          reservations: await db.reservations.count(),
          users: await db.users.count(),
        };
      });

      expect(counts.tables).toBe(16);
      expect(counts.menuItems).toBe(6);
      expect(counts.orders).toBe(8);
      expect(counts.reservations).toBe(2);
      expect(counts.users).toBe(4);
    });
  });

  test.describe('Navigation avec données seedées', () => {
    test('devrait afficher les données dans l\'application après navigation', async ({ page }) => {
      // Arrange - Seed avant navigation
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      // Act - Naviguer vers la page de login
      await page.goto('/login');

      // Assert - La page devrait charger sans erreur
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('L\'Atelier POS')).toBeVisible();
    });

    test('devrait persister les données après rechargement de la page', async ({ page }) => {
      // Arrange - Seed et navigation
      await page.evaluate(async () => {
        const { seedDatabase } = await import('../src/db/database');
        await seedDatabase();
      });

      await page.goto('/login');

      // Act - Recharger la page
      await page.reload();

      // Assert - Les données devraient toujours être présentes
      const counts = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        return {
          tables: await db.restaurantTables.count(),
          menuItems: await db.menuItems.count(),
          orders: await db.orders.count(),
          reservations: await db.reservations.count(),
        };
      });

      expect(counts.tables).toBe(16);
      expect(counts.menuItems).toBe(6);
      expect(counts.orders).toBe(8);
      expect(counts.reservations).toBe(2);
    });
  });
});
