// e2e/serveur/paiement.spec.ts
// Scénario 4 : Paiement et libération d'une table (Table Prête)

import { test, expect } from '../fixtures';

test.describe('Paiement - Table Prête', () => {
  test.beforeEach(async ({ page }) => {
    // Seed avec table T-03 prête et commande à payer
    await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      
      // Mettre à jour la table 3 avec statut pret
      await db.restaurantTables.update(3, {
        status: 'pret',
        currentOrderId: 99,
        capacity: 4,
        sector: 'Salle principale',
      });
      
      // Créer une commande pour la table 3
      await db.orders.put({
        id: 99,
        tableId: 3,
        customerName: 'Client Prêt',
        status: 'pret',
        items: [
          { name: 'Filet de Bar Rôti', quantity: 2, price: 28.50, station: 'GRILL' },
          { name: 'Café Gourmand', quantity: 2, price: 8.50, station: 'PATISSERIE' },
        ],
        total: 74.00,
        createdAt: Date.now() - 45 * 60 * 1000,
        updatedAt: Date.now() - 30 * 60 * 1000,
      });
    });
  });

  test('Serveur peut encaisser et libérer une table (paiement CB)', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 (PRÊTE)
    // ──────────────────────────────────────────────────────────────────────────
    const tableT03 = page.getByText(/T\.03/i).first();
    await tableT03.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier bouton "ENCAISSER" visible
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('button', { name: /ENCAISSER/i })).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur "ENCAISSER"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal PaymentModal s'ouvre
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/PAIEMENT/i)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Vérifier le total affiché (74€)
    await expect(page.getByText(/€74/)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner mode de paiement "CB"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Carte bancaire/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Confirmer le paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Valider/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Toast de confirmation (modal fermée)
    // ──────────────────────────────────────────────────────────────────────────
    await page.waitForTimeout(500);
    await expect(page.getByText(/PAIEMENT/i)).toBeHidden();
    await expect(page.getByRole('dialog')).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Panel SelectedTable fermé
    // ──────────────────────────────────────────────────────────────────────────
    // Le panel devrait être fermé après paiement
    await expect(page.getByText(/TABLE SÉLECTIONNÉE/i)).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Table T-03 passe à LIBRE (via IndexedDB)
    // ──────────────────────────────────────────────────────────────────────────
    const tableStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const table = await db.restaurantTables.get(3);
      return table?.status;
    });
    expect(tableStatus).toBe('libre');

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que la commande est 'paye'
    // ──────────────────────────────────────────────────────────────────────────
    const orderStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.status;
    });
    expect(orderStatus).toBe('paye');

    // Vérifier le mode de paiement
    const paymentMethod = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.paymentMethod;
    });
    expect(paymentMethod).toBe('cb');
  });

  test('Serveur peut encaisser avec paiement en espèces', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 (PRÊTE)
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.03/i).first().click();
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner mode de paiement "Espèces"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Espèces/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Saisir le montant donné par le client (100€)
    // ──────────────────────────────────────────────────────────────────────────
    const amountInput = page.getByLabel(/Montant donné/i);
    await amountInput.fill('100');

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier la monnaie à rendre (100 - 74 = 26€)
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/€26/)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Confirmer le paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Valider/i }).click();
    await page.waitForTimeout(500);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal fermée
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('dialog')).toBeHidden();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que le paiement est enregistré
    // ──────────────────────────────────────────────────────────────────────────
    const paymentMethod = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.paymentMethod;
    });
    expect(paymentMethod).toBe('especes');

    const orderStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.status;
    });
    expect(orderStatus).toBe('paye');
  });

  test('Serveur peut annuler un paiement', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 et ouvrir modal de paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.03/i).first().click();
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner un mode de paiement puis annuler
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Carte bancaire/i }).click();

    // Cliquer sur Annuler
    await page.getByRole('button', { name: /Annuler/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Modal fermée, commande non payée
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByRole('dialog')).toBeHidden();

    // Vérifier en DB que la commande n'est pas payée
    const orderStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.status;
    });
    expect(orderStatus).toBe('pret');

    const tableStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const table = await db.restaurantTables.get(3);
      return table?.status;
    });
    expect(tableStatus).toBe('pret');
  });

  test('Serveur peut encaisser avec paiement offert (gratuit)', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 et ouvrir modal de paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.03/i).first().click();
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner "Offert / Sans paiement"
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Offert/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Confirmer le paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Valider/i }).click();
    await page.waitForTimeout(500);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que le paiement est enregistré comme 'none'
    // ──────────────────────────────────────────────────────────────────────────
    const paymentMethod = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.paymentMethod;
    });
    expect(paymentMethod).toBe('none');

    const orderStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(99);
      return order?.status;
    });
    expect(orderStatus).toBe('paye');

    const tableStatus = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const table = await db.restaurantTables.get(3);
      return table?.status;
    });
    expect(tableStatus).toBe('libre');
  });

  test('Serveur ne peut pas valider un paiement en espèces avec montant insuffisant', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 et ouvrir modal de paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.03/i).first().click();
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner "Espèces" et saisir un montant insuffisant (50€ < 74€)
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Espèces/i }).click();
    const amountInput = page.getByLabel(/Montant donné/i);
    await amountInput.fill('50');

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Message d'erreur visible
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Montant insuffisant/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Bouton Valider désactivé
    // ──────────────────────────────────────────────────────────────────────────
    const validateButton = page.getByRole('button', { name: /Valider/i });
    await expect(validateButton).toBeDisabled();
  });

  test('Serveur voit la monnaie à rendre calculée automatiquement', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-03 et ouvrir modal de paiement
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.03/i).first().click();
    await page.getByRole('button', { name: /ENCAISSER/i }).click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Sélectionner "Espèces" et saisir 80€
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /Espèces/i }).click();
    const amountInput = page.getByLabel(/Montant donné/i);
    await amountInput.fill('80');

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Monnaie à rendre = 80 - 74 = 6€
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/€6/)).toBeVisible();
    await expect(page.getByText(/Monnaie à rendre/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Changer le montant à 100€
    // ──────────────────────────────────────────────────────────────────────────
    await amountInput.fill('100');

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Monnaie à rendre mise à jour = 100 - 74 = 26€
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/€26/)).toBeVisible();
  });
});
