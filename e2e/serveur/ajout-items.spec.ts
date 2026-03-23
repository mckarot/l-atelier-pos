// e2e/serveur/ajout-items.spec.ts
// Scénario 2 : Ajout d'items à une commande existante (Table Occupée)

import { test, expect } from '../fixtures';

test.describe('Ajout d\'items - Table Occupée', () => {
  test.beforeEach(async ({ page }) => {
    // Seed avec table T-02 occupée et commande existante
    await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      
      // Mettre à jour la table 2 avec une commande existante
      await db.restaurantTables.update(2, {
        status: 'occupee',
        currentOrderId: 1,
      });
      
      // Mettre à jour la commande 1 avec des items
      await db.orders.update(1, {
        tableId: 2,
        customerName: 'Test Client',
        status: 'en_preparation',
        items: [
          { name: 'Burger de l\'Atelier', quantity: 2, price: 19.50, station: 'GRILL' },
          { name: 'Salade César', quantity: 1, price: 14.00, station: 'FROID' },
        ],
        total: 53.00,
        createdAt: Date.now() - 15 * 60 * 1000,
      });
    });
  });

  test('Serveur peut ajouter des items à une commande', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02 (OCCUPÉE avec commande)
    // ──────────────────────────────────────────────────────────────────────────
    const tableT02 = page.getByText(/T\.02/i).first();
    await tableT02.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier items existants
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Burger de l'Atelier/i)).toBeVisible();
    await expect(page.getByText(/Salade César/i)).toBeVisible();
    
    // Vérifier le total initial
    const initialTotalText = await page.getByText(/€[0-9]+,[0-9]{2}/).textContent();
    expect(initialTotalText).toMatch(/€53/);

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur "AJOUTER"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /AJOUTER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal AddItemModal s'ouvre
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/AJOUTER À LA COMMANDE/i)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter 2 desserts
    // ──────────────────────────────────────────────────────────────────────────
    // Filtrer par catégorie Desserts
    await page.getByRole('button', { name: /Desserts/i }).click();

    // Ajouter "Café Gourmand"
    const cafeButton = page.getByRole('button').filter({ 
      hasText: /Café Gourmand/i 
    }).first();
    await cafeButton.click();

    await expect(page.getByText(/1 article/i)).toBeVisible();

    // Ajouter un deuxième "Café Gourmand"
    await cafeButton.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier panier : 2 articles
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/2 articles/i)).toBeVisible();

    // Vérifier le total du panier (environ 17€ pour 2 cafés)
    const cartTotalText = await page.getByText(/€[0-9]+,[0-9]{2}/).last().textContent();
    expect(cartTotalText).toMatch(/€17/);

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Valider l'ajout
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /AJOUTER/i }).last().click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Toast de confirmation (modal fermée)
    // ──────────────────────────────────────────────────────────────────────────
    await page.waitForTimeout(500);
    await expect(page.getByText(/AJOUTER À LA COMMANDE/i)).toBeHidden();
    await expect(page.getByRole('dialog')).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Panel mis à jour — affiche les nouveaux items
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Café Gourmand/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Total mis à jour (53 + 17 = 70€)
    // ──────────────────────────────────────────────────────────────────────────
    const updatedTotalText = await page.getByText(/€[0-9]+,[0-9]{2}/).first().textContent();
    expect(updatedTotalText).toMatch(/€70/);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que les items ont été ajoutés
    // ──────────────────────────────────────────────────────────────────────────
    const orderItems = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      return order?.items;
    });
    
    expect(orderItems).toHaveLength(4); // 2 items initiaux + 2 nouveaux
    expect(orderItems?.some(i => i.name.includes('Café Gourmand'))).toBe(true);
  });

  test('Serveur peut annuler l\'ajout d\'items', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner table T-02 et ouvrir modal d'ajout
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();
    await page.getByRole('button', { name: /AJOUTER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter un item puis annuler
    // ──────────────────────────────────────────────────────────────────────────
    const cafeButton = page.getByRole('button').filter({ 
      hasText: /Café Gourmand/i 
    }).first();
    await cafeButton.click();

    await expect(page.getByText(/1 article/i)).toBeVisible();

    // Cliquer sur ANNULER
    await page.getByRole('button', { name: /ANNULER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal fermée, aucun item ajouté
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('dialog')).toBeHidden();

    const orderItems = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      return order?.items;
    });
    
    expect(orderItems).toHaveLength(2); // Items initiaux uniquement
  });

  test('Serveur peut ajouter plusieurs items de catégories différentes', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner table T-02 et ouvrir modal
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();
    await page.getByRole('button', { name: /AJOUTER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter une entrée
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Entrées/i }).click();
    const foieGrasButton = page.getByRole('button').filter({ 
      hasText: /Foie Gras Maison/i 
    }).first();
    await foieGrasButton.click();

    await expect(page.getByText(/1 article/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter un plat
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Plats/i }).click();
    const entrecoteButton = page.getByRole('button').filter({ 
      hasText: /Entrecôte Black Angus/i 
    }).first();
    await entrecoteButton.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : 2 articles dans le panier
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/2 articles/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Valider l'ajout
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /AJOUTER/i }).last().click();
    await page.waitForTimeout(500);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Les nouveaux items sont visibles
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Foie Gras Maison/i)).toBeVisible();
    await expect(page.getByText(/Entrecôte Black Angus/i)).toBeVisible();

    // Vérifier en DB
    const orderItems = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      return order?.items.map(i => i.name);
    });
    
    expect(orderItems).toContain('Foie Gras Maison');
    expect(orderItems).toContain('Entrecôte Black Angus 300g');
  });
});
