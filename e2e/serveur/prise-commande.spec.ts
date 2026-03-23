// e2e/serveur/prise-commande.spec.ts
// Scénario 1 : Prise de commande sur table libre

import { test, expect } from '../fixtures';

test.describe('Prise de commande - Table Libre', () => {
  test.beforeEach(async ({ page }) => {
    // Seed avec table T-01 libre
    await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      
      // Mettre la table 1 en statut libre
      await db.restaurantTables.update(1, {
        status: 'libre',
        currentOrderId: undefined,
      });
      
      // Supprimer toute commande existante pour la table 1
      const orders = await db.orders.toArray();
      const orderForTable1 = orders.find(o => o.tableId === 1);
      if (orderForTable1) {
        await db.orders.delete(orderForTable1.id);
      }
    });
  });

  test('Serveur peut prendre une commande sur table libre', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    
    // Vérifier navigation vers /serveur
    await expect(page).toHaveURL('/serveur');
    await expect(page.getByRole('heading', { name: /Plan de Salle/i })).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélection de la table T-01 (LIBRE)
    // ──────────────────────────────────────────────────────────────────────────
    // Trouver la table T-01 et cliquer dessus
    const tableT01 = page.getByText(/T\.01/i).first();
    await tableT01.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Panel SelectedTable s'ouvre — vérifier statut "Aucune commande"
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/TABLE SÉLECTIONNÉE/i)).toBeVisible();
    await expect(page.getByText(/Aucune commande en cours/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur "PRENDRE COMMANDE"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /PRENDRE COMMANDE/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal NewOrderModal s'ouvre
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/NOUVELLE COMMANDE/i)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter 2 items au panier
    // ──────────────────────────────────────────────────────────────────────────
    // Chercher et ajouter "Burger de l'Atelier"
    const burgerButton = page.getByRole('button').filter({ 
      hasText: /Burger de l'Atelier/i 
    }).first();
    await burgerButton.click();

    // Attendre que le panier se mette à jour
    await expect(page.getByText(/1 article/i)).toBeVisible();

    // Chercher et ajouter "Tartare de Saumon"
    const tartareButton = page.getByRole('button').filter({ 
      hasText: /Tartare de Saumon/i 
    }).first();
    await tartareButton.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier panier : 2 articles
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/2 articles/i)).toBeVisible();

    // Vérifier que le total est affiché (environ 34€)
    const totalText = await page.getByText(/€[0-9]+,[0-9]{2}/).textContent();
    expect(totalText).toMatch(/€[0-9]+,[0-9]{2}/);

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Valider la commande
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /VALIDER COMMANDE/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Toast de confirmation (via le texte de succès)
    // ──────────────────────────────────────────────────────────────────────────
    // Attendre que la modal se ferme et que le panel soit mis à jour
    await page.waitForTimeout(500);
    await expect(page.getByText(/NOUVELLE COMMANDE/i)).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal fermée
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('dialog')).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Panel SelectedTable mis à jour — affiche la commande
    // ──────────────────────────────────────────────────────────────────────────
    // Les items devraient être visibles dans le panel
    await expect(page.getByText(/Burger de l'Atelier/i)).toBeVisible();
    await expect(page.getByText(/Tartare de Saumon/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que la commande a été créée
    // ──────────────────────────────────────────────────────────────────────────
    const orderExists = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const orders = await db.orders.toArray();
      // Vérifier qu'il y a une commande pour la table 1
      return orders.some(o => o.tableId === 1 && o.items.length > 0);
    });
    expect(orderExists).toBe(true);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Table T-01 passe à OCCUPÉE (via IndexedDB)
    // ──────────────────────────────────────────────────────────────────────────
    const tableStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const table = await db.restaurantTables.get(1);
      return table?.status;
    });
    expect(tableStatus).toBe('occupee');
  });

  test('Serveur peut annuler une prise de commande', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner table T-01 et ouvrir modal
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.01/i).first().click();
    await page.getByRole('button', { name: /PRENDRE COMMANDE/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Ajouter un item puis annuler
    // ──────────────────────────────────────────────────────────────────────────
    const burgerButton = page.getByRole('button').filter({ 
      hasText: /Burger de l'Atelier/i 
    }).first();
    await burgerButton.click();

    await expect(page.getByText(/1 article/i)).toBeVisible();

    // Cliquer sur ANNULER
    await page.getByRole('button', { name: /ANNULER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal fermée, aucune commande créée
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('dialog')).toBeHidden();

    const orderCount = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      return await db.orders.where('tableId').equals(1).count();
    });
    expect(orderCount).toBe(0);
  });

  test('Serveur peut filtrer par catégorie lors de la prise de commande', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner table T-01 et ouvrir modal
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.01/i).first().click();
    await page.getByRole('button', { name: /PRENDRE COMMANDE/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Filtrer par catégorie "Entrées"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Entrées/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Seules les entrées sont visibles
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Tartare de Saumon/i)).toBeVisible();
    await expect(page.getByText(/Foie Gras Maison/i)).toBeVisible();
    
    // Les plats ne devraient pas être visibles
    const burgerVisible = await page.getByText(/Burger de l'Atelier/i).isVisible();
    expect(burgerVisible).toBe(false);
  });
});
