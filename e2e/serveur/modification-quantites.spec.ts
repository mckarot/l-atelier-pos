// e2e/serveur/modification-quantites.spec.ts
// Scénario 3 : Modification des quantités d'items dans une commande

import { test, expect } from '../fixtures';

test.describe('Modification des quantités', () => {
  test.beforeEach(async ({ page }) => {
    // Seed avec table T-02 occupée et commande avec quantités
    await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      
      // Mettre à jour la table 2 avec une commande existante
      await db.restaurantTables.update(2, {
        status: 'occupee',
        currentOrderId: 1,
      });
      
      // Mettre à jour la commande 1 avec des items ayant des quantités
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

  test('Serveur peut augmenter la quantité d\'un item', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02 (OCCUPÉE)
    // ──────────────────────────────────────────────────────────────────────────
    const tableT02 = page.getByText(/T\.02/i).first();
    await tableT02.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Trouver item avec quantité "2x Burger"
    // ──────────────────────────────────────────────────────────────────────────
    // Le format affiché est "2x" suivi du nom de l'item
    await expect(page.getByText(/2x/i)).toBeVisible();
    await expect(page.getByText(/Burger de l'Atelier/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur bouton "+" pour augmenter la quantité
    // ──────────────────────────────────────────────────────────────────────────
    // Trouver le bouton d'augmentation pour le Burger
    const incrementButton = page.getByRole('button', { name: /Augmenter/i }).first();
    await incrementButton.click();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier quantité mise à jour : "3x Burger"
    // ──────────────────────────────────────────────────────────────────────────
    // Attendre la mise à jour de l'UI
    await page.waitForTimeout(300);
    
    // La quantité devrait être passée à 3
    const quantityText = await page.getByText(/3x/i).textContent();
    expect(quantityText).toMatch(/3x/);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier total mis à jour (augmenté de 19.50€)
    // ──────────────────────────────────────────────────────────────────────────
    // Total initial: 53€, après augmentation: 53 + 19.50 = 72.50€
    const totalText = await page.getByText(/€[0-9]+,[0-9]{2}/).first().textContent();
    expect(totalText).toMatch(/€72/);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que la quantité a été mise à jour
    // ──────────────────────────────────────────────────────────────────────────
    const burgerQuantity = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      const burgerItem = order?.items.find(i => i.name.includes('Burger'));
      return burgerItem?.quantity;
    });
    
    expect(burgerQuantity).toBe(3);
  });

  test('Serveur peut diminuer la quantité d\'un item', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02 (OCCUPÉE)
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();

    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Augmenter d'abord la quantité à 3x
    // ──────────────────────────────────────────────────────────────────────────
    const incrementButton = page.getByRole('button', { name: /Augmenter/i }).first();
    await incrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur bouton "-" pour diminuer la quantité
    // ──────────────────────────────────────────────────────────────────────────
    const decrementButton = page.getByRole('button', { name: /Diminuer/i }).first();
    await decrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier retour à "2x Burger"
    // ──────────────────────────────────────────────────────────────────────────
    const quantityText = await page.getByText(/2x/i).textContent();
    expect(quantityText).toMatch(/2x/);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier total retourné à 53€
    // ──────────────────────────────────────────────────────────────────────────
    const totalText = await page.getByText(/€[0-9]+,[0-9]{2}/).first().textContent();
    expect(totalText).toMatch(/€53/);
  });

  test('Serveur peut supprimer un item en diminuant à 0', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02 (OCCUPÉE)
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();

    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Trouver l'item avec quantité 1x (Salade César)
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/Salade César/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Diminuer la quantité jusqu'à 0 (suppression)
    // ──────────────────────────────────────────────────────────────────────────
    // Trouver le bouton de diminution pour la Salade César
    const decrementButton = page.getByRole('button', { name: /Diminuer/i }).last();
    await decrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : La Salade César n'est plus visible
    // ──────────────────────────────────────────────────────────────────────────
    const saladeVisible = await page.getByText(/Salade César/i).isVisible();
    expect(saladeVisible).toBe(false);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB que l'item a été supprimé
    // ──────────────────────────────────────────────────────────────────────────
    const orderItems = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      return order?.items;
    });
    
    expect(orderItems).toHaveLength(1); // Seul le Burger reste
    expect(orderItems?.some(i => i.name.includes('Salade'))).toBe(false);
  });

  test('Serveur peut modifier plusieurs quantités successivement', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02 (OCCUPÉE)
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Augmenter Burger de 2x à 4x (2 clics)
    // ──────────────────────────────────────────────────────────────────────────
    const burgerIncrementButton = page.getByRole('button', { name: /Augmenter/i }).first();
    await burgerIncrementButton.click();
    await burgerIncrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Burger est à 4x
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/4x/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Augmenter Salade de 1x à 2x
    // ──────────────────────────────────────────────────────────────────────────
    const saladeIncrementButton = page.getByRole('button', { name: /Augmenter/i }).last();
    await saladeIncrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Salade est à 2x
    // ──────────────────────────────────────────────────────────────────────────
    await expect(page.getByText(/2x Salade/i)).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier total mis à jour
    // ──────────────────────────────────────────────────────────────────────────
    // Initial: 53€
    // + 2x Burger (2 * 19.50 = 39€)
    // + 1x Salade (14€)
    // Total: 53 + 39 + 14 = 106€
    const totalText = await page.getByText(/€[0-9]+,[0-9]{2}/).first().textContent();
    expect(totalText).toMatch(/€106/);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Vérifier en DB
    // ──────────────────────────────────────────────────────────────────────────
    const orderItems = await page.evaluate(async () => {
      const { db } = await import('../../src/db/database');
      const order = await db.orders.get(1);
      return order?.items;
    });
    
    const burgerItem = orderItems?.find(i => i.name.includes('Burger'));
    const saladeItem = orderItems?.find(i => i.name.includes('Salade'));
    
    expect(burgerItem?.quantity).toBe(4);
    expect(saladeItem?.quantity).toBe(2);
  });

  test('Serveur peut voir le total se mettre à jour en temps réel', async ({ page }) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Login et navigation
    // ──────────────────────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.getByRole('button', { name: /Serveur/i }).click();
    await expect(page).toHaveURL('/serveur');

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Cliquer sur table T-02
    // ──────────────────────────────────────────────────────────────────────────
    await page.getByText(/T\.02/i).first().click();

    // ──────────────────────────────────────────────────────────────────────────
    // Arrange : Récupérer le total initial
    // ──────────────────────────────────────────────────────────────────────────
    const initialTotalElement = page.getByText(/€53/).first();
    await expect(initialTotalElement).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Augmenter la quantité d'un item
    // ──────────────────────────────────────────────────────────────────────────
    const incrementButton = page.getByRole('button', { name: /Augmenter/i }).first();
    await incrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Le total a augmenté (53€ → 72.50€)
    // ──────────────────────────────────────────────────────────────────────────
    const updatedTotalElement = page.getByText(/€72/).first();
    await expect(updatedTotalElement).toBeVisible();

    // ──────────────────────────────────────────────────────────────────────────
    // Act : Diminuer la quantité
    // ──────────────────────────────────────────────────────────────────────────
    const decrementButton = page.getByRole('button', { name: /Diminuer/i }).first();
    await decrementButton.click();
    await page.waitForTimeout(300);

    // ──────────────────────────────────────────────────────────────────────────
    // Assert : Le total est retourné à la valeur initiale
    // ──────────────────────────────────────────────────────────────────────────
    await expect(initialTotalElement).toBeVisible();
  });
});
