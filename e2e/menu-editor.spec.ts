// e2e/menu-editor.spec.ts
// Tests E2E pour l'éditeur de menu (US-024)

import { test, expect } from '@playwright/test';

test.describe('Menu Editor - US-024', () => {
  test.beforeEach(async ({ page }) => {
    // Set up role as admin
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    // Navigate to menu editor
    await page.click('text="Menu Editor"');
    await page.waitForURL('/admin/menu');
  });

  test('should display menu editor page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Éditeur de Menu');
    await expect(page.locator('text="Gérez les articles de votre carte"')).toBeVisible();
  });

  test('should display statistics', async ({ page }) => {
    await expect(page.locator('text="Total Articles"')).toBeVisible();
    await expect(page.locator('text="Disponibles"')).toBeVisible();
    await expect(page.locator('text="Indisponibles"')).toBeVisible();
    await expect(page.locator('text="Catégories"')).toBeVisible();
  });

  test('should open add modal when clicking "Ajouter un article"', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(page.locator('#modal-title')).toContainText('Ajouter un article');
  });

  test('should add a new menu item', async ({ page }) => {
    // Open add modal
    await page.click('button:has-text("Ajouter un article")');

    // Fill form
    await page.fill('#name', 'Nouveau Burger');
    await page.fill('#description', 'Burger délicieux avec fromage');
    await page.fill('#price', '18.50');
    await page.selectOption('#category', 'Plats');
    await page.selectOption('#station', 'GRILL');

    // Submit
    await page.click('button:has-text("Ajouter")');

    // Wait for modal to close and item to appear
    await page.waitForSelector('text="Nouveau Burger"');
    await expect(page.locator('text="Nouveau Burger"')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    // Try to submit without name
    await page.fill('#price', '10');
    await page.click('button:has-text("Ajouter")');

    await expect(page.locator('[role="alert"]')).toContainText('Le nom est obligatoire');
  });

  test('should validate price is positive', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    await page.fill('#name', 'Test Item');
    await page.fill('#price', '-5');
    await page.click('button:has-text("Ajouter")');

    await expect(page.locator('[role="alert"]')).toContainText('Le prix doit être un nombre supérieur à 0');
  });

  test('should toggle item availability', async ({ page }) => {
    // Find first item and toggle it
    const toggleButton = page.locator('[role="switch"]').first();
    const initialState = await toggleButton.getAttribute('aria-checked');

    await toggleButton.click();

    const newState = await toggleButton.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('should open edit modal when clicking edit button', async ({ page }) => {
    // Find first edit button
    const editButton = page.locator('button[aria-label^="Modifier"]').first();
    await editButton.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should delete an item with confirmation', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[role="row"]').count();

    // Click delete on first item
    const deleteButton = page.locator('button[aria-label^="Supprimer"]').first();
    await deleteButton.click();

    // Accept confirmation
    page.on('dialog', (dialog) => dialog.accept());

    // Wait for item to be removed
    await page.waitForTimeout(500);
    const newCount = await page.locator('[role="row"]').count();

    expect(newCount).toBeLessThan(initialCount);
  });

  test('should cancel delete when confirmation is declined', async ({ page }) => {
    const initialCount = await page.locator('[role="row"]').count();

    const deleteButton = page.locator('button[aria-label^="Supprimer"]').first();
    await deleteButton.click();

    // Decline confirmation
    page.on('dialog', (dialog) => dialog.dismiss());

    await page.waitForTimeout(500);
    const newCount = await page.locator('[role="row"]').count();

    expect(newCount).toBe(initialCount);
  });

  test('should select allergens', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    // Click on an allergen button
    const allergenButton = page.locator('button:has-text("gluten")').first();
    await allergenButton.click();

    // Check if it's selected (should have error styling)
    const className = await allergenButton.getAttribute('class');
    expect(className).toContain('error');
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(modal).not.toBeVisible();
  });

  test('should close modal by clicking outside', async ({ page }) => {
    await page.click('button:has-text("Ajouter un article")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click on overlay (outside modal)
    await page.locator('.fixed[role="dialog"]').locator('..').click();

    await expect(modal).not.toBeVisible();
  });

  test('should display items grouped by category', async ({ page }) => {
    await expect(page.locator('text="Entrées"')).toBeVisible();
    await expect(page.locator('text="Plats"')).toBeVisible();
    await expect(page.locator('text="Desserts"')).toBeVisible();
  });
});
