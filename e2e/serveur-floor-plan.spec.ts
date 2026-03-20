// e2e/serveur-floor-plan.spec.ts
// Tests E2E pour le plan de salle du module Serveur

import { test, expect } from '@playwright/test';

test.describe('Module Serveur - Plan de Salle', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant que serveur
    await page.goto('/login');
    await page.getByRole('button', { name: /serveur/i }).click();
    await page.waitForURL(/\/serveur/);
  });

  test('devrait afficher le plan de salle avec les tables', async ({ page }) => {
    // Vérifier le titre
    await expect(page.getByRole('heading', { name: /Plan de Salle/i })).toBeVisible();

    // Vérifier que les tables sont affichées
    await expect(page.getByText(/T\.\d{2}/).first()).toBeVisible();
  });

  test('devrait afficher la sidebar avec la navigation', async ({ page }) => {
    // Vérifier le logo
    await expect(page.getByText("L'Atelier")).toBeVisible();

    // Vérifier les items de navigation
    await expect(page.getByRole('link', { name: 'Menu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Commandes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tables' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tableau de bord' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Paramètres' })).toBeVisible();
  });

  test('devrait afficher le bouton Nouvelle Commande', async ({ page }) => {
    const newOrderButton = page.getByRole('button', { name: /Nouvelle Commande/i });
    await expect(newOrderButton).toBeVisible();
    await expect(newOrderButton).toBeEnabled();
  });

  test('devrait filtrer les tables par secteur', async ({ page }) => {
    // Cliquer sur un filtre de secteur
    const terrasseButton = page.getByRole('button', { name: 'Terrasse' });
    if (await terrasseButton.isVisible()) {
      await terrasseButton.click();
      // Vérifier que le filtre est actif
      await expect(page.getByText(/Terrasse •/)).toBeVisible();
    }
  });

  test('devrait afficher les stats d\'occupation', async ({ page }) => {
    // Vérifier les stats
    await expect(page.getByText(/Libres/i)).toBeVisible();
    await expect(page.getByText(/Occupées/i)).toBeVisible();
  });

  test('devrait sélectionner une table au clic', async ({ page }) => {
    // Cliquer sur la première table
    const firstTable = page.getByText(/T\.01/).first();
    if (await firstTable.isVisible()) {
      await firstTable.click();
      // Vérifier que le panel de détail s'ouvre
      await expect(page.getByText(/TABLE SÉLECTIONNÉE/i)).toBeVisible();
    }
  });

  test('devrait afficher le header avec SYNC OK', async ({ page }) => {
    await expect(page.getByText('SYNC OK')).toBeVisible();
    await expect(page.getByText('Service Midi')).toBeVisible();
  });
});
