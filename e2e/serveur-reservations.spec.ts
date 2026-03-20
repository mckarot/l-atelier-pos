// e2e/serveur-reservations.spec.ts
// Tests E2E pour le planning des réservations du module Serveur

import { test, expect } from '@playwright/test';

test.describe('Module Serveur - Réservations', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant que serveur
    await page.goto('/login');
    await page.getByRole('button', { name: /serveur/i }).click();
    await page.waitForURL(/\/serveur/);

    // Naviguer vers les réservations
    await page.getByRole('link', { name: 'Tables' }).click();
    // Note: Le routing vers /serveur/reservations doit être implémenté
  });

  test('devrait afficher le titre Réservations du Jour', async ({ page }) => {
    // Cette test nécessite que la route /serveur/reservations soit configurée
    await page.goto('/serveur/reservations');
    await expect(page.getByRole('heading', { name: /Réservations du Jour/i })).toBeVisible();
  });

  test('devrait afficher les stats d\'occupation', async ({ page }) => {
    await page.goto('/serveur/reservations');
    
    // Vérifier les stats T-X
    await expect(page.getByText(/T-\d/).first()).toBeVisible();
  });

  test('devrait afficher la section Prochaines Arrivées', async ({ page }) => {
    await page.goto('/serveur/reservations');
    await expect(page.getByRole('heading', { name: /Prochaines Arrivées/i })).toBeVisible();
  });

  test('devrait afficher le tableau des réservations', async ({ page }) => {
    await page.goto('/serveur/reservations');
    
    // Vérifier les en-têtes du tableau
    await expect(page.getByText('Heure')).toBeVisible();
    await expect(page.getByText('Client')).toBeVisible();
    await expect(page.getByText('Couverts')).toBeVisible();
    await expect(page.getByText('Statut')).toBeVisible();
  });
});
