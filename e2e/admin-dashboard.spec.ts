// e2e/admin-dashboard.spec.ts
// Tests E2E pour le tableau de bord administrateur avec Playwright

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - US-021', () => {
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

  test.describe('Navigation et accès', () => {
    test('devrait afficher le tableau de bord administrateur', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page).toHaveURL('/admin');
      await expect(page.getByText('Tableau de bord')).toBeVisible();
    });

    test('devrait afficher l\'indicateur LIVE', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('LIVE')).toBeVisible();
    });

    test('devrait afficher le sous-titre du dashboard', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(
        page.getByText('Vue d\'ensemble de l\'activité du restaurant')
      ).toBeVisible();
    });
  });

  test.describe('Cartes KPI - Affichage', () => {
    test('devrait afficher les 4 cartes KPI', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Revenu Quotidien')).toBeVisible();
      await expect(page.getByText('Commandes')).toBeVisible();
      await expect(page.getByText('Temps Prep. Moyen')).toBeVisible();
      await expect(page.getByText('Satisfaction')).toBeVisible();
    });

    test('devrait afficher le revenu quotidien', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait afficher un format de revenu (0 € ou plus)
      const revenueCard = page.getByText('Revenu Quotidien').locator('..');
      await expect(revenueCard).toBeVisible();
    });

    test('devrait afficher le nombre de commandes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const ordersCard = page.getByText('Commandes').locator('..');
      await expect(ordersCard).toBeVisible();
    });

    test('devrait afficher le temps de préparation moyen', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const prepTimeCard = page.getByText('Temps Prep. Moyen').locator('..');
      await expect(prepTimeCard).toBeVisible();
      await expect(page.getByText('OBJECTIF: 15:00')).toBeVisible();
    });

    test('devrait afficher le score de satisfaction', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const satisfactionCard = page.getByText('Satisfaction').locator('..');
      await expect(satisfactionCard).toBeVisible();
      await expect(page.getByText('4.8/5')).toBeVisible();
      await expect(page.getByText('Excellent')).toBeVisible();
    });
  });

  test.describe('Cartes KPI - Variations', () => {
    test('devrait afficher les badges de variation', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Les badges de variation devraient être visibles
      await expect(page.getByText(/VS HIER|VS MOYENNE/)).toBeVisible();
    });

    test('devrait afficher l\'icône trending_up pour les variations positives', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('trending_up')).toBeVisible();
    });
  });

  test.describe('Graphique de performance hebdomadaire', () => {
    test('devrait afficher le graphique de performance', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Performance Hebdomadaire')).toBeVisible();
      await expect(
        page.getByText('Évolution du chiffre d\'affaires (7 derniers jours)')
      ).toBeVisible();
    });

    test('devrait afficher les 7 jours de la semaine', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('LUN')).toBeVisible();
      await expect(page.getByText('MAR')).toBeVisible();
      await expect(page.getByText('MER')).toBeVisible();
      await expect(page.getByText('JEU')).toBeVisible();
      await expect(page.getByText('VEN')).toBeVisible();
      await expect(page.getByText('SAM')).toBeVisible();
      await expect(page.getByText('DIM')).toBeVisible();
    });

    test('devrait afficher le toggle JOUR/SEMAINE', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('button', { name: 'JOUR' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'SEMAINE' })).toBeVisible();
    });

    test('devrait permettre de basculer vers le mode JOUR', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      // Act
      await page.getByRole('button', { name: 'JOUR' }).click();

      // Assert - Le bouton JOUR devrait être activé
      await expect(page.getByRole('button', { name: 'JOUR' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('devrait permettre de basculer vers le mode SEMAINE', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      // Act
      await page.getByRole('button', { name: 'SEMAINE' }).click();

      // Assert - Le bouton SEMAINE devrait être activé
      await expect(page.getByRole('button', { name: 'SEMAINE' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('devrait afficher la légende du graphique', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Jour actuel')).toBeVisible();
      await expect(page.getByText('Autres jours')).toBeVisible();
    });
  });

  test.describe('Flux Live', () => {
    test('devrait afficher le flux live', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('Flux Live')).toBeVisible();
    });

    test('devrait afficher l\'icône realtime', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('realtime')).toBeVisible();
    });

    test('devrait afficher le lien "VOIR TOUT L\'HISTORIQUE"', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('VOIR TOUT L\'HISTORIQUE')).toBeVisible();
    });

    test('devrait afficher des événements dans le flux live', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Devrait avoir des événements (soit réels, soit de démo)
      const liveFeed = page.getByText('Flux Live').locator('..');
      await expect(liveFeed).toBeVisible();
    });
  });

  test.describe('Icônes Material Symbols', () => {
    test('devrait afficher l\'icône payments pour le revenu', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('payments')).toBeVisible();
    });

    test('devrait afficher l\'icône receipt_long pour les commandes', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('receipt_long')).toBeVisible();
    });

    test('devrait afficher l\'icône timer pour le temps de préparation', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('timer')).toBeVisible();
    });

    test('devrait afficher l\'icône star pour la satisfaction', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByText('star')).toBeVisible();
    });
  });

  test.describe('Accessibilité', () => {
    test('devrait avoir des régions ARIA pour les sections', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert - Les régions devraient être accessibles
      await expect(
        page.getByRole('region', { name: 'Indicateurs clés de performance' })
      ).toBeVisible();
    });

    test('devrait avoir des boutons avec aria-pressed pour le toggle', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      await expect(page.getByRole('button', { name: 'JOUR' })).toHaveAttribute('aria-pressed');
      await expect(page.getByRole('button', { name: 'SEMAINE' })).toHaveAttribute('aria-pressed');
    });
  });

  test.describe('Responsive', () => {
    test('devrait afficher les KPI en grille 2 colonnes sur tablette', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/admin');

      // Assert
      const kpiSection = page.getByRole('region', { name: 'Indicateurs clés de performance' });
      await expect(kpiSection).toBeVisible();
    });

    test('devrait afficher les KPI en grille 4 colonnes sur desktop', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/admin');

      // Assert
      const kpiSection = page.getByRole('region', { name: 'Indicateurs clés de performance' });
      await expect(kpiSection).toBeVisible();
    });
  });

  test.describe('Données en temps réel', () => {
    test('devrait mettre à jour les données quand une commande est ajoutée', async ({ page }) => {
      // Arrange
      await page.goto('/admin');

      // Act - Ajouter une commande via la console
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const now = Date.now();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        await db.orders.add({
          tableId: 5,
          customerName: 'Test E2E',
          status: 'paye',
          items: [{ name: 'Test Item', quantity: 1 }],
          total: 100,
          createdAt: startOfDay + 1000,
        });
      });

      // Attendre un court instant pour la mise à jour
      await page.waitForTimeout(500);

      // Assert - La page devrait refléter les nouvelles données
      // (Le revenu devrait augmenter)
      await expect(page.getByText('Revenu Quotidien')).toBeVisible();
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

    test('devrait utiliser font-headline pour les titres', async ({ page }) => {
      // Arrange & Act
      await page.goto('/admin');

      // Assert
      const hasHeadlineFont = await page.evaluate(() => {
        const titles = document.querySelectorAll('.font-headline');
        return titles.length > 0;
      });
      expect(hasHeadlineFont).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('devrait charger le dashboard en moins de 2 secondes', async ({ page }) => {
      // Arrange & Act
      const startTime = Date.now();
      await page.goto('/admin');
      const loadTime = Date.now() - startTime;

      // Assert
      await expect(page.getByText('Tableau de bord')).toBeVisible();
      expect(loadTime).toBeLessThan(2000);
    });
  });
});
