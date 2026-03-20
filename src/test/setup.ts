// ── CRITIQUE : doit être importé en premier ──────────────────
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';
import { db } from '../db/database';

// ── Mock localStorage pour jsdom ────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ── Nettoyage avant chaque test ─────────────────────────────
beforeEach(async () => {
  localStorage.clear();
  
  // Nettoyer la base de données Dexie avant chaque test
  await db.orders.clear();
  await db.restaurantTables.clear();
  await db.menuItems.clear();
  await db.reservations.clear();
  await db.users.clear();
});

// ── Nettoyage React Testing Library ──────────────────────────
afterEach(() => {
  cleanup();
});

// ── Nettoyage des mocks ──────────────────────────────────────
afterEach(() => {
  vi.restoreAllMocks();
});

// ── Fermeture de la DB après tous les tests ─────────────────
afterAll(async () => {
  await db.close();
});
