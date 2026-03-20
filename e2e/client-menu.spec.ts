// e2e/client-menu.spec.ts
// Tests E2E pour le module Client - Menu et commande

import { test, expect } from '@playwright/test';

test.describe('Client Module - Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Seed des données et connexion en tant que client
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('atelier_role', 'client');
    });
    await page.goto('/client');
  });

  test.describe('Navigation et layout', () => {
    test('devrait afficher la sidebar Client', async ({ page }) => {
      // Arrange & Act
      const sidebar = page.locator('aside[aria-label="Navigation principale Client"]');

      // Assert
      await expect(sidebar).toBeVisible();
      await expect(page.getByText('L\'Atelier')).toBeVisible();
      await expect(page.getByText('SERVICE CLIENT V2.4')).toBeVisible();
    });

    test('devrait afficher les 4 items de navigation', async ({ page }) => {
      // Assert
      await expect(page.getByText('Menu')).toBeVisible();
      await expect(page.getByText('Commandes')).toBeVisible();
      await expect(page.getByText('Tables')).toBeVisible();
      await expect(page.getByText('Tableau de bord')).toBeVisible();
    });

    test('devrait afficher l\'header avec le statut cuisine', async ({ page }) => {
      // Assert
      await expect(page.getByText('L\'Atelier POS')).toBeVisible();
      await expect(page.getByText('Cuisine Ouverte')).toBeVisible();
    });

    test('devrait afficher l\'horloge temps réel', async ({ page }) => {
      // Arrange
      const timeRegex = /^\d{2}:\d{2}$/;

      // Act - Attendre que l'horloge s'affiche
      const timeElement = page.locator('span.font-mono.text-on-surface-variant');

      // Assert
      await expect(timeElement).toBeVisible();
      const timeText = await timeElement.textContent();
      expect(timeText).toMatch(timeRegex);
    });
  });

  test.describe('Filtres de catégorie', () => {
    test('devrait afficher tous les filtres de catégorie', async ({ page }) => {
      // Assert
      await expect(page.getByRole('button', { name: 'Tous' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrées' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Plats' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Desserts' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Boissons' })).toBeVisible();
    });

    test('devrait filtrer les plats par catégorie', async ({ page }) => {
      // Arrange - Le filtre "Tous" devrait être actif
      const tousButton = page.getByRole('button', { name: 'Tous' });
      await expect(tousButton).toHaveClass(/bg-primary-container/);

      // Act - Cliquer sur "Plats"
      await page.getByRole('button', { name: 'Plats' }).click();

      // Assert - Le filtre "Plats" devrait être actif
      const platsButton = page.getByRole('button', { name: 'Plats' });
      await expect(platsButton).toHaveClass(/bg-primary-container/);
    });

    test('devrait afficher toutes les cartes de menu avec le filtre "Tous"', async ({ page }) => {
      // Assert - Devrait afficher plusieurs cartes
      const menuCards = page.locator('article[role="article"]');
      await expect(menuCards).toHaveCount({ min: 3 });
    });
  });

  test.describe('Cartes de menu', () => {
    test('devrait afficher les cartes de menu avec image, titre, description et prix', async ({ page }) => {
      // Arrange - Trouver la première carte
      const firstCard = page.locator('article').first();

      // Assert
      await expect(firstCard).toBeVisible();
      await expect(firstCard.locator('img')).toBeVisible();
      await expect(firstCard.locator('h3')).toBeVisible();
      await expect(firstCard.locator('p.text-on-surface-variant')).toBeVisible();
      await expect(firstCard.locator('span.font-mono')).toContainText('€');
    });

    test('devrait afficher les badges d\'allergènes si présents', async ({ page }) => {
      // Assert - Devrait y avoir des badges warning pour les allergènes
      const warningIcons = page.locator('span:has-text("warning")');
      await expect(warningIcons).toHaveCount({ min: 1 });
    });

    test('devrait afficher le bouton "Ajouter" sur chaque carte', async ({ page }) => {
      // Assert
      const addButtons = page.getByRole('button', { name: /Ajouter/ });
      await expect(addButtons).toHaveCount({ min: 3 });
    });
  });

  test.describe('Ajout au panier', () => {
    test('devrait afficher le panier après ajout d\'un item', async ({ page }) => {
      // Arrange - Trouver le premier bouton "Ajouter"
      const firstAddButton = page.getByRole('button', { name: /Ajouter/ }).first();

      // Act - Cliquer sur "Ajouter"
      await firstAddButton.click();

      // Assert - Le panier devrait s'afficher
      const cart = page.locator('aside[aria-label="Panier de commande"]');
      await expect(cart).toBeVisible();
    });

    test('devrait afficher un toast de confirmation', async ({ page }) => {
      // Arrange
      const firstAddButton = page.getByRole('button', { name: /Ajouter/ }).first();

      // Act
      await firstAddButton.click();

      // Assert - Le toast devrait apparaître
      const toast = page.locator('[role="alert"]');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('ajouté');
    });

    test('devrait incrémenter la quantité au deuxième ajout du même item', async ({ page }) => {
      // Arrange
      const firstAddButton = page.getByRole('button', { name: /Ajouter/ }).first();

      // Act - Ajouter deux fois
      await firstAddButton.click();
      await firstAddButton.click();

      // Assert - La quantité devrait être 2
      const quantityElement = page.locator('aside[aria-label="Panier de commande"] .font-mono').first();
      await expect(quantityElement).toContainText('2');
    });
  });

  test.describe('Panier', () => {
    test('devrait afficher le résumé de commande avec sous-total, TVA et total', async ({ page }) => {
      // Arrange - Ajouter un item
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Assert
      const cart = page.locator('aside[aria-label="Panier de commande"]');
      await expect(cart).toBeVisible();
      await expect(cart.getByText('Sous-total')).toBeVisible();
      await expect(cart.getByText('TVA (10%)')).toBeVisible();
      await expect(cart.getByText('Total')).toBeVisible();
    });

    test('devrait afficher les boutons de type de commande', async ({ page }) => {
      // Arrange
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Assert
      const cart = page.locator('aside[aria-label="Panier de commande"]');
      await expect(cart.getByRole('button', { name: 'SUR PLACE' })).toBeVisible();
      await expect(cart.getByRole('button', { name: 'À EMPORTER' })).toBeVisible();
    });

    test('devrait permettre de changer le type de commande', async ({ page }) => {
      // Arrange
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Act - Cliquer sur "À EMPORTER"
      await page.getByRole('button', { name: 'À EMPORTER' }).click();

      // Assert - Le bouton devrait être actif
      const emporterButton = page.getByRole('button', { name: 'À EMPORTER' });
      await expect(emporterButton).toHaveClass(/bg-primary/);
    });

    test('devrait permettre de modifier la quantité', async ({ page }) => {
      // Arrange
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Act - Augmenter la quantité
      const increaseButton = page.locator('aside[aria-label="Panier de commande"]')
        .getByLabelText('Augmenter la quantité');
      await increaseButton.click();

      // Assert - La quantité devrait augmenter
      const quantityElement = page.locator('aside[aria-label="Panier de commande"] .w-8.text-center');
      await expect(quantityElement).toContainText('2');
    });

    test('devrait permettre de supprimer un item', async ({ page }) => {
      // Arrange
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Act - Supprimer l'item
      const deleteButton = page.locator('aside[aria-label="Panier de commande"]')
        .getByLabelText('Supprimer l\'article');
      await deleteButton.click();

      // Assert - Le panier devrait disparaître
      const cart = page.locator('aside[aria-label="Panier de commande"]');
      await expect(cart).not.toBeVisible();
    });

    test('devrait afficher le bouton "PAYER" avec le total', async ({ page }) => {
      // Arrange
      await page.getByRole('button', { name: /Ajouter/ }).first().click();

      // Assert
      const payButton = page.locator('aside[aria-label="Panier de commande"]')
        .getByRole('button', { name: /PAYER/ });
      await expect(payButton).toBeVisible();
      await expect(payButton).toContainText('€');
    });
  });

  test.describe('Personnalisation', () => {
    test('devrait afficher l\'indicateur "Personnalisable" sur les items concernés', async ({ page }) => {
      // Assert - Devrait y avoir au moins un item personnalisable
      const customizableItems = page.getByText('Personnalisable');
      await expect(customizableItems).toHaveCount({ min: 1 });
    });

    test('devrait ouvrir le modal de personnalisation au clic sur "Ajouter"', async ({ page }) => {
      // Arrange - Trouver un item personnalisable (Burger de l'Atelier)
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });

      // Act - Cliquer sur "Ajouter"
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Assert - Le modal devrait s'ouvrir
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText('Personnalisation : Burger')).toBeVisible();
    });

    test('devrait afficher les options de cuisson dans le modal', async ({ page }) => {
      // Arrange - Ouvrir le modal
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Assert
      await expect(page.getByText('Cuisson')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Bleu' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Saignant' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'À Point' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Bien Cuit' })).toBeVisible();
    });

    test('devrait afficher les suppléments dans le modal', async ({ page }) => {
      // Arrange - Ouvrir le modal
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Assert
      await expect(page.getByText('Suppléments')).toBeVisible();
      await expect(page.getByText('Double Fromage')).toBeVisible();
      await expect(page.getByText('Bacon Croustillant')).toBeVisible();
    });

    test('devrait permettre de sélectionner une cuisson', async ({ page }) => {
      // Arrange - Ouvrir le modal
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Act - Sélectionner "Saignant"
      await page.getByRole('button', { name: 'Saignant' }).click();

      // Assert - Le bouton devrait être actif
      const saignantButton = page.getByRole('button', { name: 'Saignant' });
      await expect(saignantButton).toHaveClass(/bg-primary-container/);
    });

    test('devrait permettre de sélectionner des suppléments', async ({ page }) => {
      // Arrange - Ouvrir le modal
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Act - Sélectionner un supplément
      await page.getByText('Bacon Croustillant').click();

      // Assert - Le supplément devrait être sélectionné
      const baconRow = page.locator('button').filter({ hasText: 'Bacon Croustillant' });
      await expect(baconRow).toHaveClass(/border-primary-container/);
    });

    test('devrait mettre à jour le total en temps réel', async ({ page }) => {
      // Arrange - Ouvrir le modal
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();

      // Act - Sélectionner un supplément
      await page.getByText('Bacon Croustillant').click();

      // Assert - Le total devrait augmenter
      const totalElement = page.locator('[role="dialog"]').getByText(/€$/).last();
      await expect(totalElement).not.toContainText('19.50€'); // Devrait être > 19.50€
    });

    test('devrait ajouter l\'item au panier après confirmation', async ({ page }) => {
      // Arrange - Ouvrir le modal et personnaliser
      const burgerCard = page.locator('article').filter({ hasText: 'Burger' });
      await burgerCard.getByRole('button', { name: /Ajouter/ }).click();
      await page.getByRole('button', { name: 'Saignant' }).click();

      // Act - Confirmer
      await page.getByRole('button', { name: 'Ajouter au Panier' }).click();

      // Assert - Le panier devrait s'afficher
      const cart = page.locator('aside[aria-label="Panier de commande"]');
      await expect(cart).toBeVisible();
      await expect(cart.getByText('Saignant')).toBeVisible();
    });
  });

  test.describe('Responsive', () => {
    test('devrait afficher une grille 1 colonne sur mobile', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 375, height: 667 });

      // Assert
      const grid = page.locator('[role="list"]');
      await expect(grid).toHaveClass(/grid-cols-1/);
    });

    test('devrait afficher une grille 2 colonnes sur tablette', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 768, height: 1024 });

      // Assert
      const grid = page.locator('[role="list"]');
      await expect(grid).toHaveClass(/md:grid-cols-2/);
    });

    test('devrait afficher une grille 3 colonnes sur desktop', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 1280, height: 800 });

      // Assert
      const grid = page.locator('[role="list"]');
      await expect(grid).toHaveClass(/lg:grid-cols-3/);
    });
  });

  test.describe('Accessibilité', () => {
    test('chaque carte devrait avoir un rôle article', async ({ page }) => {
      // Assert
      const articles = page.locator('article[role="article"]');
      await expect(articles).toHaveCount({ min: 3 });
    });

    test('les filtres devraient avoir un rôle tablist', async ({ page }) => {
      // Assert
      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toBeVisible();
    });

    test('les boutons devraient être focusables au clavier', async ({ page }) => {
      // Act - Naviguer avec Tab
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Assert
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
    });
  });
});
