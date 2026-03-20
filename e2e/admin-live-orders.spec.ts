// e2e/admin-live-orders.spec.ts
// Tests E2E Playwright pour la vue Live Orders Admin

import { test, expect } from '@playwright/test';
import type { Order } from '../src/db/types';

test.describe('Admin Live Orders - E2E', () => {
  // Seed des données avant chaque test via page.evaluate()
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('userRole', 'admin');
    });
  });

  test.describe('Navigation et rendu initial', () => {
    test('devrait naviguer vers /admin/orders et afficher la vue Live Orders', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page).toHaveURL('/admin/orders');
      await expect(page.getByText('Live Orders')).toBeVisible();
      await expect(page.getByText('Suivez et gérez toutes les commandes en temps réel')).toBeVisible();
    });

    test('devrait afficher "00 COMMANDES ACTIVES" sans commandes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('00 COMMANDES ACTIVES')).toBeVisible();
    });

    test('devrait afficher l\'icône receipt_long dans l\'en-tête', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.locator('.material-symbols-outlined:has-text("receipt_long")')).toBeVisible();
    });
  });

  test.describe('Affichage du tableau des commandes', () => {
    test('devrait afficher les commandes actives avec toutes les informations', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 12,
          customerName: 'Pierre Dupont',
          status: 'en_attente',
          items: [
            { name: 'Tartare de Saumon', quantity: 2, station: 'FROID' },
            { name: 'Filet de Boeuf', quantity: 1, station: 'GRILL' },
          ],
          total: 45.50,
          createdAt: Date.now() - 10 * 60 * 1000,
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('Table 12')).toBeVisible();
      await expect(page.getByText('Pierre Dupont')).toBeVisible();
      await expect(page.getByText(/2x Tartare de Saumon/)).toBeVisible();
      await expect(page.getByText('EN ATTENTE')).toBeVisible();
    });

    test('devrait afficher les commandes triées par date décroissante', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const now = Date.now();
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Ancienne',
            status: 'en_attente',
            items: [],
            total: 10,
            createdAt: now - 30 * 60 * 1000,
          },
          {
            id: 2,
            tableId: 2,
            customerName: 'Récente',
            status: 'en_attente',
            items: [],
            total: 20,
            createdAt: now - 5 * 60 * 1000,
          },
          {
            id: 3,
            tableId: 3,
            customerName: 'Intermédiaire',
            status: 'en_attente',
            items: [],
            total: 30,
            createdAt: now - 15 * 60 * 1000,
          },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert - Vérifier l'ordre visuel (la plus récente en premier)
      const table = page.locator('table[aria-label="Commandes en direct"]');
      const rows = table.locator('tbody tr');
      
      await expect(rows.nth(0)).toContainText('Récente');
      await expect(rows.nth(1)).toContainText('Intermédiaire');
      await expect(rows.nth(2)).toContainText('Ancienne');
    });

    test('devrait afficher "Aucune commande active" sans commandes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('Aucune commande active')).toBeVisible();
    });

    test('devrait afficher le footer avec le compteur de commandes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
          { id: 3, tableId: 3, customerName: 'Test 3', status: 'en_attente', items: [], total: 30, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('3 commandes affichées')).toBeVisible();
    });
  });

  test.describe('Filtres et recherche', () => {
    test('devrait filtrer par statut "En attente"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
          { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');

      // Sélectionner le filtre "En attente"
      await page.locator('#status-filter').selectOption('en_attente');

      // Assert
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).not.toBeVisible();
      await expect(page.getByText('#ORD-0003')).not.toBeVisible();
    });

    test('devrait filtrer par statut "En préparation"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
          { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#status-filter').selectOption('en_preparation');

      // Assert
      await expect(page.getByText('#ORD-0002')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).not.toBeVisible();
      await expect(page.getByText('#ORD-0003')).not.toBeVisible();
    });

    test('devrait filtrer par statut "Prêt"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Test 2', status: 'en_preparation', items: [], total: 20, createdAt: Date.now() },
          { id: 3, tableId: 3, customerName: 'Test 3', status: 'pret', items: [], total: 30, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#status-filter').selectOption('pret');

      // Assert
      await expect(page.getByText('#ORD-0003')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).not.toBeVisible();
      await expect(page.getByText('#ORD-0002')).not.toBeVisible();
    });

    test('devrait rechercher par nom de client', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Pierre Dupont', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Marie Laurent', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#order-search').fill('pierre');

      // Assert
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).not.toBeVisible();
    });

    test('devrait rechercher par numéro de table', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 5, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 12, customerName: 'Test 2', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#order-search').fill('12');

      // Assert
      await expect(page.getByText('#ORD-0002')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).not.toBeVisible();
    });

    test('devrait rechercher par numéro de commande', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 123, tableId: 1, customerName: 'Test 1', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 456, tableId: 2, customerName: 'Test 2', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#order-search').fill('456');

      // Assert
      await expect(page.getByText('#ORD-0456')).toBeVisible();
      await expect(page.getByText('#ORD-0123')).not.toBeVisible();
    });

    test('devrait effacer la recherche au clic sur le bouton clear', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Pierre', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
          { id: 2, tableId: 2, customerName: 'Marie', status: 'en_attente', items: [], total: 20, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#order-search').fill('pierre');

      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).not.toBeVisible();

      await page.locator('button[aria-label="Effacer la recherche"]').click();

      // Assert
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).toBeVisible();
    });

    test('devrait afficher "Aucune commande ne correspond aux filtres" sans résultats', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          { id: 1, tableId: 1, customerName: 'Pierre', status: 'en_attente', items: [], total: 10, createdAt: Date.now() },
        ] as Order[]);
      });

      // Act
      await page.goto('/admin/orders');
      await page.locator('#order-search').fill('marie');

      // Assert
      await expect(page.getByText('Aucune commande ne correspond aux filtres')).toBeVisible();
    });
  });

  test.describe('Timers et couleurs', () => {
    test('devrait afficher le timer avec le temps écoulé', async ({ page }) => {
      // Arrange - Commande créée il y a 5 minutes 30 secondes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now() - 5 * 60 * 1000 - 30 * 1000,
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('05:30')).toBeVisible();
    });

    test('devrait afficher le timer en orange pour 10-20min', async ({ page }) => {
      // Arrange - Commande créée il y a 15 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now() - 15 * 60 * 1000,
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      const timer = page.locator('[role="status"] span').filter({ hasText: '15:00' });
      await expect(timer).toHaveClass(/text-secondary/);
    });

    test('devrait afficher le timer en rouge avec icône warning pour 20min+', async ({ page }) => {
      // Arrange - Commande créée il y a 25 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now() - 25 * 60 * 1000,
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      const timer = page.locator('[role="status"] span').filter({ hasText: '25:00' });
      await expect(timer).toHaveClass(/text-error/);
      await expect(page.locator('.material-symbols-outlined:has-text("warning")')).toBeVisible();
    });
  });

  test.describe('Actions LANCER et TERMINER', () => {
    test('devrait afficher le bouton LANCER pour une commande en_attente', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByRole('button', { name: /lancer la préparation/i })).toBeVisible();
      await expect(page.getByText('Lancer')).toBeVisible();
    });

    test('devrait afficher le bouton TERMINER pour une commande en_preparation', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByRole('button', { name: /marquer la commande.*comme prête/i })).toBeVisible();
      await expect(page.getByText('Terminer')).toBeVisible();
    });

    test('devrait lancer la préparation au clic sur LANCER', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 42,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');
      await page.getByText('Lancer').click();

      // Assert - Vérifier le statut en DB
      const status = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const order = await db.orders.get(42);
        return order?.status;
      });
      expect(status).toBe('en_preparation');
    });

    test('devrait terminer la commande au clic sur TERMINER', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 99,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');
      await page.getByText('Terminer').click();

      // Assert - Vérifier le statut en DB
      const status = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const order = await db.orders.get(99);
        return order?.status;
      });
      expect(status).toBe('pret');
    });

    test('ne devrait PAS afficher de bouton pour une commande pret', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'pret',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.getByText('Lancer')).not.toBeVisible();
      await expect(page.getByText('Terminer')).not.toBeVisible();
      await expect(page.getByText('Complète')).toBeVisible();
    });
  });

  test.describe('Mise à jour réactive (useLiveQuery)', () => {
    test('devrait mettre à jour l\'affichage quand une commande est ajoutée', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
      });

      // Act - Naviguer vers la page
      await page.goto('/admin/orders');

      // Assert initial
      await expect(page.getByText('00 COMMANDES ACTIVES')).toBeVisible();

      // Ajouter une commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Nouveau',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Assert - Mise à jour réactive
      await expect(page.getByText('01 COMMANDES ACTIVES')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();
    });

    test('devrait mettre à jour l\'affichage quand une commande change de statut', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('EN ATTENTE')).toBeVisible();

      // Changer le statut
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.update(1, { status: 'en_preparation' });
      });

      // Assert - Mise à jour réactive
      await expect(page.getByText('EN PRÉPARATION')).toBeVisible();
    });

    test('devrait mettre à jour l\'affichage quand une commande est supprimée', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.clear();
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      await expect(page.getByText('#ORD-0001')).toBeVisible();

      // Supprimer la commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.delete(1);
      });

      // Assert - Mise à jour réactive
      await expect(page.getByText('#ORD-0001')).not.toBeVisible();
      await expect(page.getByText('00 COMMANDES ACTIVES')).toBeVisible();
    });
  });

  test.describe('Accessibilité', () => {
    test('devrait avoir un rôle search sur la section de filtres', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.locator('[role="search"]')).toBeVisible();
    });

    test('devrait avoir des labels accessibles pour les inputs', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.locator('label[for="status-filter"]')).toBeVisible();
      await expect(page.locator('label[for="order-search"]')).toBeVisible();
    });

    test('devrait avoir un aria-label sur chaque ligne du tableau', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 5,
          tableId: 12,
          customerName: 'Test',
          status: 'en_attente',
          items: [],
          total: 10,
          createdAt: Date.now(),
        } as Order);
      });

      // Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.locator('tr[aria-label="Commande 5, table 12"]')).toBeVisible();
    });

    test('devrait avoir un rôle region sur le tableau des commandes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin/orders');

      // Assert
      await expect(page.locator('[role="region"][aria-label="Tableau des commandes"]')).toBeVisible();
    });
  });
});
