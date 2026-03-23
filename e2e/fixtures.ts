// e2e/fixtures.ts
// Fixtures Playwright pour le seed de la base de données

import { test as base, expect } from '@playwright/test';

export const test = base.extend<{
  seedDatabase: boolean;
}>({
  // Seed par défaut - données de base
  seedDatabase: [async ({ page }, use) => {
    await page.evaluate(async () => {
      const { seedDatabase } = await import('../src/db/database');
      await seedDatabase();
    });
    await use(true);
  }, { auto: true }],
});

export { expect };
