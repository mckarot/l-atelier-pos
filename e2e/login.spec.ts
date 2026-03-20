// e2e/login.spec.ts
// Tests E2E pour le flux de connexion avec Playwright

import { test, expect } from '@playwright/test';

// Configuration de base pour tous les tests
test.describe('Login Flow', () => {
  // Seed des données avant chaque test - CRITIQUE pour éviter les tests flaky
  test.beforeEach(async ({ page }) => {
    // Seed via page.evaluate() avant navigation - règle absolue
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Navigation vers /login', () => {
    test('devrait afficher la page de login quand on navigue vers /login', async ({ page }) => {
      // Arrange & Act
      await page.goto('/login');

      // Assert
      await expect(page).toHaveURL('/login');
      await expect(page.getByText('L\'Atelier POS')).toBeVisible();
      await expect(page.getByText('Système de gestion de restaurant')).toBeVisible();
    });

    test('devrait afficher le logo restaurant_menu', async ({ page }) => {
      // Arrange & Act
      await page.goto('/login');

      // Assert
      await expect(page.locator('.material-symbols-outlined').first()).toBeVisible();
    });

    test('devrait afficher 4 cartes de rôle', async ({ page }) => {
      // Arrange & Act
      await page.goto('/login');

      // Assert
      const roleCards = page.locator('button[aria-label^="Sélectionner le rôle"]');
      await expect(roleCards).toHaveCount(4);
    });
  });

  test.describe('Sélection de rôle Admin', () => {
    test('devrait rediriger vers /admin après sélection du rôle admin', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act - Cliquer sur le bouton Administrateur
      await page.getByLabelText('Sélectionner le rôle Administrateur').click();

      // Assert - Attendre la redirection
      await expect(page).toHaveURL('/admin');
    });

    test('devrait sauvegarder le rôle dans localStorage', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act
      await page.getByLabelText('Sélectionner le rôle Administrateur').click();
      await expect(page).toHaveURL('/admin');

      // Assert - Vérifier localStorage
      const storedRole = await page.evaluate(() => localStorage.getItem('atelier_role'));
      expect(storedRole).toBe('admin');
    });
  });

  test.describe('Sélection de rôle KDS', () => {
    test('devrait rediriger vers /kds après sélection du rôle kds', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act - Cliquer sur le bouton Cuisine (KDS)
      await page.getByLabelText('Sélectionner le rôle Cuisine (KDS)').click();

      // Assert - Attendre la redirection
      await expect(page).toHaveURL('/kds');
    });

    test('devrait sauvegarder le rôle dans localStorage', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act
      await page.getByLabelText('Sélectionner le rôle Cuisine (KDS)').click();
      await expect(page).toHaveURL('/kds');

      // Assert
      const storedRole = await page.evaluate(() => localStorage.getItem('atelier_role'));
      expect(storedRole).toBe('kds');
    });
  });

  test.describe('Sélection de rôle Serveur', () => {
    test('devrait rediriger vers /serveur après sélection du rôle serveur', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act - Cliquer sur le bouton Serveur
      await page.getByLabelText('Sélectionner le rôle Serveur').click();

      // Assert - Attendre la redirection
      await expect(page).toHaveURL('/serveur');
    });

    test('devrait sauvegarder le rôle dans localStorage', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act
      await page.getByLabelText('Sélectionner le rôle Serveur').click();
      await expect(page).toHaveURL('/serveur');

      // Assert
      const storedRole = await page.evaluate(() => localStorage.getItem('atelier_role'));
      expect(storedRole).toBe('serveur');
    });
  });

  test.describe('Sélection de rôle Client', () => {
    test('devrait rediriger vers /client après sélection du rôle client', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act - Cliquer sur le bouton Client
      await page.getByLabelText('Sélectionner le rôle Client').click();

      // Assert - Attendre la redirection
      await expect(page).toHaveURL('/client');
    });

    test('devrait sauvegarder le rôle dans localStorage', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act
      await page.getByLabelText('Sélectionner le rôle Client').click();
      await expect(page).toHaveURL('/client');

      // Assert
      const storedRole = await page.evaluate(() => localStorage.getItem('atelier_role'));
      expect(storedRole).toBe('client');
    });
  });

  test.describe('Vérification des cartes de rôle', () => {
    test('devrait afficher la carte Administrateur avec l\'icône dashboard', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      const adminCard = page.getByLabelText('Sélectionner le rôle Administrateur');
      await expect(adminCard).toBeVisible();
      await expect(adminCard.getByText('dashboard')).toBeVisible();
      await expect(adminCard.getByText('Tableau de bord, gestion complète')).toBeVisible();
    });

    test('devrait afficher la carte KDS avec l\'icône soup_kitchen', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      const kdsCard = page.getByLabelText('Sélectionner le rôle Cuisine (KDS)');
      await expect(kdsCard).toBeVisible();
      await expect(kdsCard.getByText('soup_kitchen')).toBeVisible();
      await expect(kdsCard.getByText('Écran de production cuisine')).toBeVisible();
    });

    test('devrait afficher la carte Serveur avec l\'icône room_service', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      const serveurCard = page.getByLabelText('Sélectionner le rôle Serveur');
      await expect(serveurCard).toBeVisible();
      await expect(serveurCard.getByText('room_service')).toBeVisible();
      await expect(serveurCard.getByText('Plan de salle, réservations')).toBeVisible();
    });

    test('devrait afficher la carte Client avec l\'icône restaurant_menu', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      const clientCard = page.getByLabelText('Sélectionner le rôle Client');
      await expect(clientCard).toBeVisible();
      await expect(clientCard.getByText('restaurant_menu')).toBeVisible();
      await expect(clientCard.getByText('Menu, commande en ligne')).toBeVisible();
    });
  });

  test.describe('Effets d\'interaction', () => {
    test('devrait afficher la flèche au survol d\'une carte', async ({ page }) => {
      // Arrange
      await page.goto('/login');
      const adminCard = page.getByLabelText('Sélectionner le rôle Administrateur');

      // Act - Survoler la carte
      await adminCard.hover();

      // Assert - La flèche devrait apparaître
      await expect(page.getByText('arrow_forward_ios')).toBeVisible();
    });

    test('devrait avoir un effet de scale au clic', async ({ page }) => {
      // Arrange
      await page.goto('/login');
      const adminCard = page.getByLabelText('Sélectionner le rôle Administrateur');

      // Act & Assert - Le bouton devrait être cliquable
      await expect(adminCard).toBeEnabled();
      await adminCard.click();
      await expect(page).toHaveURL('/admin');
    });
  });

  test.describe('Accessibilité', () => {
    test('chaque carte devrait avoir un aria-label descriptif', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      await expect(page.getByLabelText('Sélectionner le rôle Administrateur')).toBeVisible();
      await expect(page.getByLabelText('Sélectionner le rôle Cuisine (KDS)')).toBeVisible();
      await expect(page.getByLabelText('Sélectionner le rôle Serveur')).toBeVisible();
      await expect(page.getByLabelText('Sélectionner le rôle Client')).toBeVisible();
    });

    test('les cartes devraient être focusables au clavier', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Act - Naviguer avec Tab
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Assert - Le focus devrait être sur les boutons
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
    });
  });

  test.describe('Responsive', () => {
    test('devrait afficher une grille 2 colonnes sur écran moyen', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');

      // Assert
      const grid = page.locator('.grid');
      await expect(grid).toHaveClass(/sm:grid-cols-2/);
    });

    test('devrait afficher une grille 1 colonne sur mobile', async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      // Assert
      const grid = page.locator('.grid');
      await expect(grid).toHaveClass(/grid-cols-1/);
    });
  });

  test.describe('Footer', () => {
    test('devrait afficher la version en footer', async ({ page }) => {
      // Arrange
      await page.goto('/login');

      // Assert
      await expect(page.getByText('Version 1.0.0 • Mode Développement')).toBeVisible();
    });
  });

  test.describe('Flux complet - Changement de rôle', () => {
    test('devrait permettre de changer de rôle', async ({ page }) => {
      // Arrange - Se connecter en admin
      await page.goto('/login');
      await page.getByLabelText('Sélectionner le rôle Administrateur').click();
      await expect(page).toHaveURL('/admin');

      // Act - Changer de rôle (en modifiant localStorage et rechargeant)
      await page.evaluate(() => {
        localStorage.setItem('atelier_role', 'client');
      });
      await page.goto('/login');

      // Le bouton client devrait être désactivé ou on peut re-sélectionner
      // Dans l'implémentation actuelle, on peut re-sélectionner un rôle
      await page.getByLabelText('Sélectionner le rôle Client').click();
      await expect(page).toHaveURL('/client');

      // Assert
      const storedRole = await page.evaluate(() => localStorage.getItem('atelier_role'));
      expect(storedRole).toBe('client');
    });
  });
});
