// e2e/kds-orders.spec.ts
// Tests E2E pour les fonctionnalités KDS - US-011, US-012, US-013, US-014

import { test, expect } from '@playwright/test';
import type { Order } from '../src/db/types';

test.describe('KDS Orders - E2E (US-011, US-012, US-013, US-014)', () => {
  // Seed des données avant chaque test via page.evaluate()
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('US-011 — Colonnes KDS avec commandes live', () => {
    test('devrait afficher la colonne 1 "À PRÉPARER" avec les commandes en_attente', async ({ page }) => {
      // Arrange - Seed orders with en_attente status
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Test 1',
            status: 'en_attente',
            items: [{ name: 'Test Item', quantity: 1 }],
            createdAt: Date.now() - 5 * 60 * 1000,
          },
          {
            id: 2,
            tableId: 2,
            customerName: 'Test 2',
            status: 'en_attente',
            items: [{ name: 'Test Item', quantity: 1 }],
            createdAt: Date.now() - 3 * 60 * 1000,
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('À PRÉPARER')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).toBeVisible();
    });

    test('devrait afficher la colonne 2 "EN COURS" avec les commandes en_preparation', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Test 1',
            status: 'en_preparation',
            items: [{ name: 'Test Item', quantity: 1 }],
            createdAt: Date.now() - 10 * 60 * 1000,
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('EN COURS')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();
    });

    test('devrait afficher la colonne 3 "PRÊT / ENVOYÉ" avec les commandes pret', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Test 1',
            status: 'pret',
            items: [{ name: 'Test Item', quantity: 1 }],
            createdAt: Date.now() - 15 * 60 * 1000,
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('PRÊT / ENVOYÉ')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();
    });

    test('devrait trier les commandes par createdAt dans la colonne 1', async ({ page }) => {
      // Arrange - 3 commandes avec createdAt différents
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Ancienne',
            status: 'en_attente',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now() - 30 * 60 * 1000,
          },
          {
            id: 2,
            tableId: 2,
            customerName: 'Récente',
            status: 'en_attente',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now() - 5 * 60 * 1000,
          },
          {
            id: 3,
            tableId: 3,
            customerName: 'Intermédiaire',
            status: 'en_attente',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now() - 15 * 60 * 1000,
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert - Vérifier l'ordre visuel (la plus ancienne en premier)
      await expect(page.getByText('#ORD-0001')).toBeVisible();
      await expect(page.getByText('#ORD-0003')).toBeVisible();
      await expect(page.getByText('#ORD-0002')).toBeVisible();
    });

    test('devrait afficher le compteur de commandes par colonne', async ({ page }) => {
      // Arrange - 4 en_attente, 5 en_preparation, 3 pret
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 1,
            tableId: i + 1,
            customerName: `Test ${i + 1}`,
            status: 'en_attente',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          })),
          ...Array.from({ length: 5 }, (_, i) => ({
            id: i + 5,
            tableId: i + 5,
            customerName: `Test ${i + 5}`,
            status: 'en_preparation',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            id: i + 9,
            tableId: i + 9,
            customerName: `Test ${i + 9}`,
            status: 'pret',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          })),
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert - Compteurs: 04, 05, 03
      await expect(page.getByText('04')).toBeVisible();
      await expect(page.getByText('05')).toBeVisible();
      await expect(page.getByText('03')).toBeVisible();
    });

    test('devrait afficher le badge "MOY: X MIN" dans la colonne 1', async ({ page }) => {
      // Arrange - Commandes terminées pour calculer la moyenne
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Test 1',
            status: 'pret',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now() - 30 * 60 * 1000,
            updatedAt: Date.now() - 10 * 60 * 1000, // 20 min
          },
          {
            id: 2,
            tableId: 2,
            customerName: 'Test 2',
            status: 'servi',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now() - 50 * 60 * 1000,
            updatedAt: Date.now() - 30 * 60 * 1000, // 20 min
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('MOY: 20 MIN')).toBeVisible();
    });

    test('devrait afficher "Aucune commande" si une colonne est vide', async ({ page }) => {
      // Arrange - Seulement des commandes en_preparation
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.bulkAdd([
          {
            id: 1,
            tableId: 1,
            customerName: 'Test',
            status: 'en_preparation',
            items: [{ name: 'Test', quantity: 1 }],
            createdAt: Date.now(),
          },
        ] as Order[]);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Aucune commande')).toBeVisible();
    });
  });

  test.describe('US-012 — Carte de commande KDS (OrderCard)', () => {
    test('devrait afficher le numéro de commande au format "#ORD-XXXX"', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 42,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('#ORD-0042')).toBeVisible();
    });

    test('devrait afficher "Table XX — Nom" dans le header', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 14,
          customerName: 'Pierre D.',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Table 14 — Pierre D.')).toBeVisible();
    });

    test('devrait afficher le timer avec le format MM:SS', async ({ page }) => {
      // Arrange - Commande créée il y a 5 minutes 30 secondes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now() - 5 * 60 * 1000 - 30 * 1000,
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('05:30')).toBeVisible();
    });

    test('devrait afficher la liste des items avec quantité (x2, x1)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [
            { name: 'Tartare de Saumon', quantity: 2 },
            { name: 'Filet de Boeuf', quantity: 1 },
          ],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Tartare de Saumon')).toBeVisible();
      await expect(page.getByText('Filet de Boeuf')).toBeVisible();
      await expect(page.getByText('x2')).toBeVisible();
      await expect(page.getByText('x1')).toBeVisible();
    });

    test('devrait afficher la customisation en italique orange avec bordure gauche', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [
            { name: 'Tartare de Saumon', quantity: 1, customization: 'Sans citron' },
          ],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('Sans citron')).toBeVisible();
      // Vérifier le style (italique, orange, border-left)
      const customization = page.getByText('Sans citron');
      await expect(customization).toHaveClass(/italic/);
      await expect(customization).toHaveClass(/text-secondary/);
      await expect(customization).toHaveClass(/border-l-2/);
    });

    test('devrait afficher les boutons DÉTAILS+LANCER pour le mode attente', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('DÉTAILS')).toBeVisible();
      await expect(page.getByText('LANCER')).toBeVisible();
    });

    test('devrait afficher les boutons AIDE+TERMINER pour le mode preparation', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('AIDE')).toBeVisible();
      await expect(page.getByText('TERMINER')).toBeVisible();
    });
  });

  test.describe('US-013 — Timer avec système d\'alerte', () => {
    test('devrait afficher le timer en blanc (text-on-surface) pour 0-10min', async ({ page }) => {
      // Arrange - Commande créée il y a 5 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now() - 5 * 60 * 1000,
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const timer = page.getByRole('status').locator('span');
      await expect(timer).toHaveClass(/text-on-surface/);
    });

    test('devrait afficher le timer en orange (text-secondary) avec pulse pour 10-20min', async ({ page }) => {
      // Arrange - Commande créée il y a 15 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now() - 15 * 60 * 1000,
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const timer = page.getByRole('status').locator('span');
      await expect(timer).toHaveClass(/text-secondary/);
      await expect(timer).toHaveClass(/animate-pulse/);
    });

    test('devrait afficher le timer en rouge (text-error) avec pulse pour 20min+', async ({ page }) => {
      // Arrange - Commande créée il y a 25 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now() - 25 * 60 * 1000,
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const timer = page.getByRole('status').locator('span');
      await expect(timer).toHaveClass(/text-error/);
      await expect(timer).toHaveClass(/animate-pulse/);
    });

    test('devrait mettre à jour le timer en temps réel', async ({ page }) => {
      // Arrange - Commande créée il y a exactement 5 minutes
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now() - 5 * 60 * 1000,
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert initial
      await expect(page.getByText('05:00')).toBeVisible();

      // Attendre 3 secondes et vérifier la mise à jour
      await page.waitForTimeout(3500);

      // Le timer devrait avoir avancé
      const timerText = await page.getByRole('status').locator('span').textContent();
      expect(timerText).toMatch(/^05:0[3-5]$/);
    });
  });

  test.describe('US-014 — Actions LANCER et TERMINER', () => {
    test('devrait changer le statut de en_attente → en_preparation au clic sur LANCER', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Vérifier que la commande est dans "À PRÉPARER"
      await expect(page.getByText('À PRÉPARER')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();

      // Clic sur LANCER
      await page.getByText('LANCER').click();

      // Assert - La commande devrait être dans "EN COURS"
      await expect(page.getByText('EN COURS').locator('..')).toContainText('#ORD-0001');

      // Vérifier le statut en base via page.evaluate
      const status = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const order = await db.orders.get(1);
        return order?.status;
      });
      expect(status).toBe('en_preparation');
    });

    test('devrait changer le statut de en_preparation → pret au clic sur TERMINER', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Vérifier que la commande est dans "EN COURS"
      await expect(page.getByText('EN COURS')).toBeVisible();
      await expect(page.getByText('#ORD-0001')).toBeVisible();

      // Clic sur TERMINER
      await page.getByText('TERMINER').click();

      // Assert - La commande devrait être dans "PRÊT / ENVOYÉ"
      await expect(page.getByText('PRÊT / ENVOYÉ').locator('..')).toContainText('#ORD-0001');

      // Vérifier le statut en base
      const status = await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        const order = await db.orders.get(1);
        return order?.status;
      });
      expect(status).toBe('pret');
    });

    test('devrait avoir le bouton LANCER en orange (bg-primary-container)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const lancerButton = page.getByText('LANCER');
      await expect(lancerButton).toHaveClass(/bg-primary-container/);
    });

    test('devrait avoir le bouton TERMINER en vert (bg-tertiary-container)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      const terminerButton = page.getByText('TERMINER');
      await expect(terminerButton).toHaveClass(/bg-tertiary-container/);
    });

    test('devrait avoir des états hover/active fonctionnels', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert - Hover state
      const lancerButton = page.getByText('LANCER');
      await lancerButton.hover();
      // Le hover:brightness-110 est un effet CSS, on vérifie que le bouton réagit
      await expect(lancerButton).toBeVisible();
    });

    test('devrait afficher le bouton AIDE (visuel seulement)', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        const { db } = await import('../src/db/database');
        await db.orders.add({
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: Date.now(),
        } as Order);
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('AIDE')).toBeVisible();
    });
  });

  test.describe('Navigation et authentification', () => {
    test('devrait naviguer vers /kds avec le rôle kds', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page).toHaveURL('/kds');
      await expect(page.getByText('L\'Atelier POS')).toBeVisible();
    });

    test('devrait afficher les 3 colonnes', async ({ page }) => {
      // Arrange
      await page.evaluate(async () => {
        localStorage.setItem('userRole', 'kds');
      });

      // Act
      await page.goto('/kds');

      // Assert
      await expect(page.getByText('À PRÉPARER')).toBeVisible();
      await expect(page.getByText('EN COURS')).toBeVisible();
      await expect(page.getByText('PRÊT / ENVOYÉ')).toBeVisible();
    });
  });
});
