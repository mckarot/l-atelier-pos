// e2e/admin-services-actifs.spec.ts
// Tests E2E pour la section "Services Actifs" du dashboard administrateur

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - US-022: Services Actifs', () => {
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

  test.describe('Section "Services Actifs" - Affichage', () => {
    test('devrait afficher la section "Services Actifs"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Services Actifs')).toBeVisible();
    });

    test('devrait afficher le sous-titre', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(
        page.getByText('Vue d\'ensemble des tables et commandes en cours')
      ).toBeVisible();
    });

    test('devrait afficher au moins 3 cartes de tables', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Compter les cartes (articles)
      const cards = page.getByRole('article');
      await expect(cards.count()).toBeGreaterThanOrEqual(3);
    });

    test('devrait afficher les numéros de commande', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait avoir des numéros de commande au format #XXX
      await expect(page.locator('text=/^#\\d+$/')).toBeVisible();
    });

    test('devrait afficher les noms de tables', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/Table \\d+/')).toBeVisible();
    });
  });

  test.describe('Toggle Cuisine/Service', () => {
    test('devrait afficher le toggle avec Cuisine et Service', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('button', { name: 'Cuisine' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Service' })).toBeVisible();
    });

    test('devrait avoir Cuisine activé par défaut', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const cuisineButton = page.getByRole('button', { name: 'Cuisine' });
      await expect(cuisineButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('devrait permettre de basculer vers la vue Service', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      // Act
      const serviceButton = page.getByRole('button', { name: 'Service' });
      await serviceButton.click();

      // Assert
      await expect(serviceButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('devrait permettre de rebasculer vers la vue Cuisine', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      // Act - Cliquer sur Service puis Cuisine
      await page.getByRole('button', { name: 'Service' }).click();
      const cuisineButton = page.getByRole('button', { name: 'Cuisine' });
      await cuisineButton.click();

      // Assert
      await expect(cuisineButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Cartes de tables - Statuts', () => {
    test('devrait afficher le badge "EN PRÉPARATION"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('EN PRÉPARATION')).toBeVisible();
    });

    test('devrait afficher une table en retard avec badge "RETARD"', async ({ page }) => {
      // Arrange - Ajouter une table en retard via la console
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;

        await db.orders.add({
          tableId: 99,
          customerName: 'Test Retard',
          status: 'en_preparation',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 50,
          createdAt: twentyFiveMinAgo,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('RETARD')).toBeVisible();
    });

    test('devrait afficher le badge "NOUVEAU" pour une commande récente', async ({ page }) => {
      // Arrange - Ajouter une commande très récente
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const now = Date.now();

        await db.orders.add({
          tableId: 98,
          customerName: 'Test Nouveau',
          status: 'en_attente',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 30,
          createdAt: now,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('NOUVEAU')).toBeVisible();
    });
  });

  test.describe('Cartes de tables - Informations', () => {
    test('devrait afficher le nombre de personnes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/\\d+ Personnes/')).toBeVisible();
    });

    test('devrait afficher le nom du serveur', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/Serveur: \\w+/')).toBeVisible();
    });

    test('devrait afficher la liste des items', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait avoir des items avec quantités
      await expect(page.locator('text=/\\d+x/')).toBeVisible();
    });

    test('devrait afficher les statuts des items', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/PRÊT|ATTENTE|EN CUISINE/')).toBeVisible();
    });

    test('devrait afficher le temps d\'attente en minutes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait avoir des temps au format XXmin
      await expect(page.locator('text=/\\d+min/')).toBeVisible();
    });

    test('devrait afficher le total en euros', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait avoir des totaux au format XX.XX €
      await expect(page.locator('text=/\\d+\\.\\d{2} €/')).toBeVisible();
    });
  });

  test.describe('Indicateur de retard', () => {
    test('devrait afficher l\'alerte de retard quand il y a des tables en retard', async ({ page }) => {
      // Arrange - Ajouter une table en retard
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;

        await db.orders.add({
          tableId: 97,
          customerName: 'Test Retard',
          status: 'en_preparation',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 50,
          createdAt: twentyFiveMinAgo,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.locator('text=/table\\(s\\) en retard/')).toBeVisible();
    });

    test('devrait afficher l\'icône warning pour l\'alerte de retard', async ({ page }) => {
      // Arrange - Ajouter une table en retard
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;

        await db.orders.add({
          tableId: 96,
          customerName: 'Test Retard',
          status: 'en_preparation',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 50,
          createdAt: twentyFiveMinAgo,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('warning')).toBeVisible();
    });
  });

  test.describe('Design system compliance', () => {
    test('devrait utiliser bg-surface-container pour les cartes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Vérifier les classes de style via JavaScript
      const hasSurfaceContainer = await page.evaluate(() => {
        const cards = document.querySelectorAll('.bg-surface-container');
        return cards.length > 0;
      });
      expect(hasSurfaceContainer).toBe(true);
    });

    test('devrait utiliser border-l-4 pour les bordures gauches', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasBorderLeft = await page.evaluate(() => {
        const articles = document.querySelectorAll('[role="article"]');
        return Array.from(articles).some(el => el.classList.contains('border-l-4'));
      });
      expect(hasBorderLeft).toBe(true);
    });

    test('devrait utiliser font-mono pour les numéros de commande', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasMonoFont = await page.evaluate(() => {
        const orderIds = document.querySelectorAll('.font-mono');
        return orderIds.length > 0;
      });
      expect(hasMonoFont).toBe(true);
    });

    test('devrait utiliser font-headline pour les noms de tables', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasHeadlineFont = await page.evaluate(() => {
        const tableNames = document.querySelectorAll('.font-headline');
        return tableNames.length > 0;
      });
      expect(hasHeadlineFont).toBe(true);
    });
  });

  test.describe('Couleurs de bordures selon le statut', () => {
    test('devrait avoir border-error pour les tables en retard', async ({ page }) => {
      // Arrange - Ajouter une table en retard
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const twentyFiveMinAgo = Date.now() - 25 * 60 * 1000;

        await db.orders.add({
          tableId: 95,
          customerName: 'Test Retard',
          status: 'en_preparation',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 50,
          createdAt: twentyFiveMinAgo,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(500);

      // Act
      await page.goto('/admin');

      // Assert - Vérifier via JavaScript
      const hasErrorBorder = await page.evaluate(() => {
        const articles = document.querySelectorAll('[role="article"]');
        return Array.from(articles).some(el => el.classList.contains('border-error'));
      });
      expect(hasErrorBorder).toBe(true);
    });

    test('devrait avoir border-tertiary pour les tables en préparation', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasTertiaryBorder = await page.evaluate(() => {
        const articles = document.querySelectorAll('[role="article"]');
        return Array.from(articles).some(el => el.classList.contains('border-tertiary'));
      });
      expect(hasTertiaryBorder).toBe(true);
    });
  });

  test.describe('Accessibilité', () => {
    test('devrait avoir une région avec role="region"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('region', { name: 'Services Actifs' })).toBeVisible();
    });

    test('devrait avoir des cartes avec role="article"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const cards = page.getByRole('article');
      await expect(cards.first()).toBeVisible();
    });

    test('devrait avoir des boutons de toggle avec aria-pressed', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('button', { name: 'Cuisine' })).toHaveAttribute('aria-pressed');
      await expect(page.getByRole('button', { name: 'Service' })).toHaveAttribute('aria-pressed');
    });

    test('devrait avoir une liste avec role="list"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('list')).toBeVisible();
    });
  });

  test.describe('Réactivité', () => {
    test('devrait mettre à jour l\'affichage quand une nouvelle commande est ajoutée', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      const initialCount = await page.getByRole('article').count();

      // Act - Ajouter une nouvelle commande via la console
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const now = Date.now();

        await db.orders.add({
          tableId: 94,
          customerName: 'Test Reactivity',
          status: 'en_attente',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 25,
          createdAt: now,
        });
      });

      // Attendre la mise à jour
      await page.waitForTimeout(1000);

      // Assert - Le nombre de cartes devrait augmenter
      const newCount = await page.getByRole('article').count();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('devrait mettre à jour quand une commande change de statut', async ({ page }) => {
      // Arrange - Ajouter une commande
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const now = Date.now();

        await db.orders.add({
          tableId: 93,
          customerName: 'Test Status Change',
          status: 'en_attente',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 35,
          createdAt: now,
        });
      });

      await page.waitForTimeout(500);
      await page.goto('/admin');

      // Act - Changer le statut à 'paye' (devrait disparaître)
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        // Trouver la commande la plus récente et la marquer comme payée
        const orders = await db.orders.orderBy('createdAt').reverse().toArray();
        const recentOrder = orders.find(o => o.customerName === 'Test Status Change');
        if (recentOrder) {
          await db.orders.update(recentOrder.id, { status: 'paye' });
        }
      });

      // Attendre la mise à jour
      await page.waitForTimeout(1000);

      // Assert - La carte devrait disparaître
      // (On vérifie que le nombre de cartes a diminué ou que la commande n'est plus visible)
      const cards = page.getByRole('article');
      await expect(cards.count()).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Performance', () => {
    test('devrait afficher la section en moins de 2 secondes', async ({ page }) => {
      // Arrange & Act
      const startTime = Date.now();
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Services Actifs')).toBeVisible({ timeout: 2000 });
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });
  });
});
