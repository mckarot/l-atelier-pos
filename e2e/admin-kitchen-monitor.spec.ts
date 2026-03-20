// e2e/admin-kitchen-monitor.spec.ts
// Tests E2E pour le moniteur cuisine en direct (US-023)

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - US-023: Moniteur Cuisine en Direct', () => {
  // Seed des données avant chaque test
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('atelier_role', 'admin');
    });

    // Seed de la base de données
    await page.evaluate(async () => {
      const { seedDatabase } = await import('../src/db/database');
      await seedDatabase();
    });

    await page.goto('/admin');
  });

  test.describe('Section "Moniteur Cuisine en Direct" - Affichage', () => {
    test('devrait afficher le titre "MONITEUR CUISINE EN DIRECT"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('MONITEUR CUISINE EN DIRECT')).toBeVisible();
    });

    test('devrait afficher le compteur de commandes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait afficher "X COMMANDE(S) EN COURS"
      await expect(page.locator('text=/\\d+ COMMANDE/')).toBeVisible();
    });

    test('devrait afficher l\'indicateur "SYNC OK"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('SYNC OK')).toBeVisible();
    });

    test('devrait afficher les 5 colonnes du tableau', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('COMMANDE')).toBeVisible();
      await expect(page.getByText('TABLE')).toBeVisible();
      await expect(page.getByText('ITEMS')).toBeVisible();
      await expect(page.getByText('TEMPS ÉCOULÉ')).toBeVisible();
      await expect(page.getByText('STATUT')).toBeVisible();
    });
  });

  test.describe('Tableau des commandes', () => {
    test('devrait afficher les numéros de commande au format #ORD-XXXX', async ({ page }) => {
      // Arrange - Ajouter une commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Devrait afficher #ORD-XXXX
      await expect(page.locator('text=/^#ORD-\\d{4}$/')).toBeVisible();
    });

    test('devrait afficher les noms de table au format "Table XX"', async ({ page }) => {
      // Arrange - Ajouter une commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 8,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/Table \\d{2}/')).toBeVisible();
    });

    test('devrait afficher les items avec quantité (2x, 1x)', async ({ page }) => {
      // Arrange - Ajouter une commande avec plusieurs items
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [
            { name: 'Burger Classique', quantity: 2 },
            { name: 'Salade César', quantity: 1 },
          ],
          total: 50,
          createdAt: Date.now(),
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/2x/')).toBeVisible();
      await expect(page.locator('text=/1x/')).toBeVisible();
      await expect(page.getByText('Burger Classique')).toBeVisible();
      await expect(page.getByText('Salade César')).toBeVisible();
    });

    test('devrait afficher les items avec style pill (rounded-full)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Vérifier via JavaScript
      const hasRoundedFull = await page.evaluate(() => {
        const items = document.querySelectorAll('[role="status"]');
        return Array.from(items).some(el => el.classList.contains('rounded-full'));
      });
      expect(hasRoundedFull).toBe(true);
    });
  });

  test.describe('Temps écoulé - Couleurs', () => {
    test('devrait afficher le temps en vert si < 10 minutes', async ({ page }) => {
      // Arrange - Commande créée il y a 5 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: fiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Le temps devrait être en vert (text-tertiary)
      const timeElement = page.locator('text=/\\d{2}:\\d{2}/').first();
      await expect(timeElement).toHaveClass(/text-tertiary/);
    });

    test('devrait afficher le temps en orange si entre 10 et 20 minutes', async ({ page }) => {
      // Arrange - Commande créée il y a 15 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: fifteenMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Le temps devrait être en orange (text-secondary)
      const timeElement = page.locator('text=/\\d{2}:\\d{2}/').first();
      await expect(timeElement).toHaveClass(/text-secondary/);
    });

    test('devrait afficher le temps en rouge si > 20 minutes', async ({ page }) => {
      // Arrange - Commande créée il y a 25 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: twentyFiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Le temps devrait être en rouge (text-error)
      const timeElement = page.locator('text=/\\d{2}:\\d{2}/').first();
      await expect(timeElement).toHaveClass(/text-error/);
    });

    test('devrait afficher le temps au format MM:SS', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Devrait correspondre au format MM:SS
      await expect(page.locator('text=/^\\d{2}:\\d{2}$/')).toBeVisible();
    });
  });

  test.describe('Statut des commandes', () => {
    test('devrait afficher "EN PRÉPARATION" pour une commande normale', async ({ page }) => {
      // Arrange - Commande récente
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: fiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('EN PRÉPARATION')).toBeVisible();
    });

    test('devrait afficher "RETARDÉ" pour une commande > 20 minutes', async ({ page }) => {
      // Arrange - Commande créée il y a 25 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: twentyFiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('RETARDÉ')).toBeVisible();
    });

    test('devrait afficher l\'icône warning pour le statut RETARDÉ', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: twentyFiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('warning')).toBeVisible();
    });

    test('devrait afficher l\'icône set_meal pour le statut EN PRÉPARATION', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: fiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('set_meal')).toBeVisible();
    });
  });

  test.describe('Bandeau "ALERTE STOCK CRITIQUE"', () => {
    test('devrait afficher le bandeau quand il y a des articles épuisés', async ({ page }) => {
      // Arrange - Ajouter un article épuisé
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.menuItems.add({
          id: 999,
          name: 'Item Épuisé',
          description: 'Test',
          price: 10,
          category: 'Entrées',
          isAvailable: 0,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('ALERTE STOCK CRITIQUE')).toBeVisible();
    });

    test('devrait afficher le message avec les counts', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        // Ajouter 3 articles épuisés
        for (let i = 0; i < 3; i++) {
          await db.menuItems.add({
            id: 1000 + i,
            name: `Item ${i}`,
            description: 'Test',
            price: 10,
            category: 'Entrées',
            isAvailable: 0,
          });
        }
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/articles? sont épuisés/')).toBeVisible();
    });

    test('devrait afficher le bouton "GÉRER LE STOCK"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.menuItems.add({
          id: 999,
          name: 'Item Épuisé',
          description: 'Test',
          price: 10,
          category: 'Entrées',
          isAvailable: 0,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('GÉRER LE STOCK')).toBeVisible();
    });

    test('devrait utiliser bg-error-container pour le fond', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.menuItems.add({
          id: 999,
          name: 'Item Épuisé',
          description: 'Test',
          price: 10,
          category: 'Entrées',
          isAvailable: 0,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Vérifier via JavaScript
      const hasErrorContainer = await page.evaluate(() => {
        const alerts = document.querySelectorAll('[role="alert"]');
        return Array.from(alerts).some(el => el.classList.contains('bg-error-container'));
      });
      expect(hasErrorContainer).toBe(true);
    });

    test('devrait afficher l\'icône warning', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.menuItems.add({
          id: 999,
          name: 'Item Épuisé',
          description: 'Test',
          price: 10,
          category: 'Entrées',
          isAvailable: 0,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('[role="alert"] text=warning')).toBeVisible();
    });
  });

  test.describe('Design system compliance', () => {
    test('devrait utiliser font-mono pour le titre', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasMonoFont = await page.evaluate(() => {
        const titles = document.querySelectorAll('.font-mono');
        return Array.from(titles).some(el =>
          el.textContent?.includes('MONITEUR CUISINE EN DIRECT')
        );
      });
      expect(hasMonoFont).toBe(true);
    });

    test('devrait utiliser font-mono pour les numéros de commande', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      const hasMonoFont = await page.evaluate(() => {
        const orderIds = document.querySelectorAll('.font-mono');
        return Array.from(orderIds).some(el =>
          el.textContent?.includes('#ORD-')
        );
      });
      expect(hasMonoFont).toBe(true);
    });

    test('devrait utiliser font-label font-bold pour les noms de table', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      const hasLabelFont = await page.evaluate(() => {
        const tableNames = document.querySelectorAll('.font-label');
        return Array.from(tableNames).some(el =>
          el.textContent?.includes('Table')
        );
      });
      expect(hasLabelFont).toBe(true);
    });

    test('devrait utiliser bg-surface-container pour le fond', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasSurfaceContainer = await page.evaluate(() => {
        const regions = document.querySelectorAll('[role="region"]');
        return Array.from(regions).some(el =>
          el.classList.contains('bg-surface-container')
        );
      });
      expect(hasSurfaceContainer).toBe(true);
    });
  });

  test.describe('Accessibilité', () => {
    test('devrait avoir un rôle region pour le moniteur', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(
        page.getByRole('region', { name: 'MONITEUR CUISINE EN DIRECT' })
      ).toBeVisible();
    });

    test('devrait avoir un rôle table', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 4,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('table')).toBeVisible();
    });

    test('devrait avoir un rôle alert pour le bandeau stock', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.menuItems.add({
          id: 999,
          name: 'Item Épuisé',
          description: 'Test',
          price: 10,
          category: 'Entrées',
          isAvailable: 0,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('alert', { name: 'Alerte stock critique' })).toBeVisible();
    });
  });

  test.describe('Réactivité', () => {
    test('devrait mettre à jour l\'affichage quand une nouvelle commande est ajoutée', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      const initialCount = await page.locator('text=/^#ORD-/').count();

      // Act - Ajouter une nouvelle commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          tableId: 99,
          customerName: 'Test Reactivity',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: Date.now(),
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(1000);

      // Assert - Le nombre de commandes devrait augmenter
      const newCount = await page.locator('text=/^#ORD-/').count();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('devrait mettre à jour le statut quand une commande devient en retard', async ({ page }) => {
      // Arrange - Ajouter une commande qui sera en retard dans 2 secondes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;
        await db.orders.add({
          tableId: 99,
          customerName: 'Test Retard',
          status: 'en_preparation',
          items: [{ name: 'Burger', quantity: 1 }],
          total: 20,
          createdAt: twentyFiveMinAgo,
        });
      });

      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Devrait afficher RETARDÉ
      await expect(page.getByText('RETARDÉ')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('devrait afficher le moniteur en moins de 2 secondes', async ({ page }) => {
      // Arrange & Act
      const startTime = Date.now();
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('MONITEUR CUISINE EN DIRECT')).toBeVisible({ timeout: 2000 });
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });
  });
});
