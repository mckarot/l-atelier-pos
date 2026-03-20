// e2e/sync-indicator.spec.ts
// Tests E2E pour l'indicateur de synchronisation (US-050) et mode hors-ligne (US-051)

import { test, expect } from '@playwright/test';

test.describe('Sync Indicator - US-050', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');
  });

  test('should display sync indicator on admin page', async ({ page }) => {
    const syncIndicator = page.locator('[role="status"]').first();
    await expect(syncIndicator).toBeVisible();
  });

  test('should show connected status', async ({ page }) => {
    await expect(page.locator('text="DEXIE.JS CONNECTÉ"')).toBeVisible();
  });

  test('should display pulsing indicator', async ({ page }) => {
    const pingElement = page.locator('.animate-ping');
    await expect(pingElement).toBeVisible();
  });

  test('should display last sync timestamp', async ({ page }) => {
    await expect(page.locator('text="Dernière synchronisation"')).toBeVisible();
  });

  test('should display version number', async ({ page }) => {
    await expect(page.locator('text="v1.0.0"')).toBeVisible();
  });

  test('should have green border when connected', async ({ page }) => {
    const indicator = page.locator('[role="status"]').first();
    const className = await indicator.getAttribute('class');
    expect(className).toContain('border-tertiary');
  });

  test('should display cloud_done icon when connected', async ({ page }) => {
    await expect(page.locator('text="cloud_done"')).toBeVisible();
  });
});

test.describe('Offline Banner - US-051', () => {
  test('should not display offline banner when online', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    // Offline banner should not be visible when online
    const offlineBanner = page.locator('[aria-label="Mode hors-ligne activé"]');
    await expect(offlineBanner).not.toBeVisible();
  });

  test('should display offline banner when going offline', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    // Simulate offline mode
    await page.context().setOffline(true);

    const offlineBanner = page.locator('[aria-label="Mode hors-ligne activé"]');
    await expect(offlineBanner).toBeVisible();
    await expect(offlineBanner).toContainText('Mode hors-ligne — vos données sont sauvegardées');
  });

  test('should hide offline banner when coming back online', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    // Go offline
    await page.context().setOffline(true);
    const offlineBanner = page.locator('[aria-label="Mode hors-ligne activé"]');
    await expect(offlineBanner).toBeVisible();

    // Come back online
    await page.context().setOffline(false);
    await expect(offlineBanner).not.toBeVisible();
  });

  test('should display offline banner on KDS page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Cuisine (KDS)"');
    await page.waitForURL('/kds');

    await page.context().setOffline(true);

    const offlineBanner = page.locator('[aria-label="Mode hors-ligne activé"]');
    await expect(offlineBanner).toBeVisible();
  });

  test('should display offline banner on Serveur page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Serveur"');
    await page.waitForURL('/serveur');

    await page.context().setOffline(true);

    const offlineBanner = page.locator('[aria-label="Mode hors-ligne activé"]');
    await expect(offlineBanner).toBeVisible();
  });

  test('should have correct accessibility attributes', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    await page.context().setOffline(true);

    const offlineBanner = page.locator('[role="alert"]');
    await expect(offlineBanner).toHaveAttribute('aria-live', 'assertive');
  });

  test('should display cloud_off icon when offline', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    await page.context().setOffline(true);

    await expect(page.locator('text="cloud_off"')).toBeVisible();
  });

  test('should have red styling when offline', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Administrateur"');
    await page.waitForURL('/admin');

    await page.context().setOffline(true);

    const banner = page.locator('[role="alert"]');
    const className = await banner.getAttribute('class');
    expect(className).toContain('bg-error-container');
    expect(className).toContain('text-error');
  });
});

test.describe('Sync Indicator on different pages', () => {
  test('should display sync indicator on KDS page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Cuisine (KDS)"');
    await page.waitForURL('/kds');

    const syncIndicator = page.locator('[role="status"]').first();
    await expect(syncIndicator).toBeVisible();
  });

  test('should display sync indicator on Serveur page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Serveur"');
    await page.waitForURL('/serveur');

    const syncIndicator = page.locator('[role="status"]').first();
    await expect(syncIndicator).toBeVisible();
  });

  test('should update status when connection changes on KDS', async ({ page }) => {
    await page.goto('/login');
    await page.click('text="Cuisine (KDS)"');
    await page.waitForURL('/kds');

    await page.context().setOffline(true);

    await expect(page.locator('text="HORS LIGNE"')).toBeVisible();
  });
});
