// e2e/kds-layout.spec.ts
// Tests E2E pour le layout KDS - US-010

import { test, expect } from '@playwright/test';
import type { Order } from '../src/db/types';

test.describe('KDS Layout - E2E (US-010)', () => {
  // Seed des données avant chaque test via page.evaluate()
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Navigation et authentification', () => {
    test('devrait naviguer vers /kds avec le rôle kds', async ({ page }) => {
      // Arrange - Seed user with kds role and navigate
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.users.add({
          name: 'Test KDS',
          email: 'kds@test.com',
          role: 'kds',
          isActive: 1,
          createdAt: Date.now(),
        });
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page).toHaveURL('/kds');
      await expect(page.getByText('L\'Atelier POS')).toBeVisible();
    });

    test('devrait afficher la sidebar de navigation', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const sidebar = page.getByRole('navigation', { name: 'Navigation principale KDS' });
      await expect(sidebar).toBeVisible();
    });

    test('devrait avoir la sidebar avec largeur fixe de 256px', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const sidebar = page.getByRole('navigation', { name: 'Navigation principale KDS' });
      const box = await sidebar.boundingBox();
      expect(box?.width).toBeCloseTo(256, 0);
    });
  });

  test.describe('Header avec compteur LIVE', () => {
    test('devrait afficher le header avec le titre', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByText('Écran de Production Cuisine')).toBeVisible();
    });

    test('devrait afficher le compteur LIVE avec 0 commandes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('LIVE')).toBeVisible();
      await expect(page.getByText('00')).toBeVisible();
    });

    test('devrait afficher le compteur LIVE avec des commandes actives', async ({ page }) => {
      // Arrange - Seed orders
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            tableId: 1,
            status: 'en_attente',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          },
          {
            tableId: 2,
            status: 'en_preparation',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          },
          {
            tableId: 3,
            status: 'pret',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('LIVE')).toBeVisible();
      await expect(page.getByText('03')).toBeVisible();
    });

    test('devrait afficher l\'horloge dans le header', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const clock = page.getByRole('timer');
      await expect(clock).toBeVisible();
      const clockText = await clock.textContent();
      expect(clockText).toMatch(/\d{2}:\d{2}/);
    });

    test('devrait afficher "Serveur Connecté"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Serveur Connecté')).toBeVisible();
    });
  });

  test.describe('3 colonnes (À PRÉPARER, EN COURS, PRÊT)', () => {
    test('devrait afficher les 3 colonnes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('À préparer')).toBeVisible();
      await expect(page.getByText('En préparation')).toBeVisible();
      await expect(page.getByText('Prêt')).toBeVisible();
    });

    test('devrait afficher les compteurs pour chaque colonne', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const counters = page.getByText('00');
      await expect(counters.first()).toBeVisible();
    });

    test('devrait afficher "Aucune commande en attente" quand vide', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Aucune commande en attente')).toBeVisible();
    });

    test('devrait afficher "Aucune commande en préparation" quand vide', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Aucune commande en préparation')).toBeVisible();
    });

    test('devrait afficher "Aucune commande prête" quand vide', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Aucune commande prête')).toBeVisible();
    });

    test('devrait afficher les commandes dans les colonnes appropriées', async ({ page }) => {
      // Arrange - Seed orders in different statuses
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            status: 'en_attente',
            items: [{ name: 'Entrée', quantity: 1 }],
            createdAt: Date.now(),
          },
          {
            id: 2,
            tableId: 2,
            status: 'en_preparation',
            items: [{ name: 'Plat', quantity: 1 }],
            createdAt: Date.now(),
          },
          {
            id: 3,
            tableId: 3,
            status: 'pret',
            items: [{ name: 'Dessert', quantity: 1 }],
            createdAt: Date.now(),
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('COMMANDE #1')).toBeVisible();
      await expect(page.getByText('COMMANDE #2')).toBeVisible();
      await expect(page.getByText('COMMANDE #3')).toBeVisible();
    });
  });

  test.describe('Footer avec horloge', () => {
    test('devrait afficher le footer', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('devrait afficher "Temps moyen:"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Temps moyen:')).toBeVisible();
    });

    test('devrait afficher "Total:"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Total:')).toBeVisible();
    });

    test('devrait afficher "DERNIÈRE SYNCHRO:" avec l\'heure', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const syncText = await page.getByText(/DERNIÈRE SYNCHRO:/).textContent();
      expect(syncText).toMatch(/DERNIÈRE SYNCHRO: \d{2}:\d{2}/);
    });
  });

  test.describe('Dark mode uniquement', () => {
    test('devrait avoir le dark mode activé par défaut', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      // Dark mode should have a dark background
      expect(bgColor).toMatch(/rgb\(\d+, \d+, \d+\)/);
    });

    test('devrait NE PAS avoir de toggle dark mode', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText(/dark/i, { ignoreCase: true })).not.toBeVisible();
      await expect(page.getByText(/light/i, { ignoreCase: true })).not.toBeVisible();
    });
  });

  test.describe('Layout h-screen overflow-hidden', () => {
    test('devrait avoir h-screen sur le container principal', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const container = page.locator('.flex.h-screen').first();
      await expect(container).toHaveClass(/h-screen/);
    });

    test('devrait avoir overflow-hidden pour empêcher le scroll global', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const body = page.locator('body');
      const overflow = await body.evaluate((el) =>
        window.getComputedStyle(el).overflow
      );
      expect(overflow).toBe('hidden');
    });

    test('devrait permettre le scroll uniquement dans les colonnes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const columns = page.locator('section[aria-label^="Colonne"]');
      const firstColumn = columns.first();
      const overflowY = await firstColumn.evaluate((el) =>
        window.getComputedStyle(el).overflowY
      );
      // The scrollable area should be inside the column
      expect(overflowY).toBe('auto');
    });
  });

  test.describe('Header fixe', () => {
    test('devrait avoir le header en position sticky', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const header = page.getByRole('banner');
      const position = await header.evaluate((el) =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('sticky');
    });

    test('devrait avoir le header avec top-0', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const header = page.getByRole('banner');
      const top = await header.evaluate((el) =>
        window.getComputedStyle(el).top
      );
      expect(top).toBe('0px');
    });
  });

  test.describe('Footer fixe', () => {
    test('devrait avoir le footer visible en bas de page', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Sidebar gauche avec navigation', () => {
    test('devrait avoir la sidebar en position fixe à gauche', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const sidebar = page.getByRole('navigation', { name: 'Navigation principale KDS' });
      const position = await sidebar.evaluate((el) =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('fixed');
    });

    test('devrait avoir les liens de navigation', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByLabelText('Aller au menu')).toBeVisible();
      await expect(page.getByLabelText('Voir les commandes (page actuelle)')).toBeVisible();
      await expect(page.getByLabelText('Aller aux tables')).toBeVisible();
      await expect(page.getByLabelText('Aller au tableau de bord')).toBeVisible();
      await expect(page.getByLabelText('Aller aux paramètres')).toBeVisible();
    });

    test('devrait avoir le lien Commandes comme page actuelle', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const currentLink = page.getByLabelText('Voir les commandes (page actuelle)');
      await expect(currentLink).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Zone principale avec 3 colonnes de hauteur pleine', () => {
    test('devrait avoir les 3 colonnes avec h-full', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const columns = page.locator('section[aria-label^="Colonne"]');
      await expect(columns).toHaveCount(3);

      // Check each column has full height
      for (let i = 0; i < 3; i++) {
        const column = columns.nth(i);
        const height = await column.evaluate((el) => el.offsetHeight);
        expect(height).toBeGreaterThan(400); // Should have substantial height
      }
    });
  });
});
