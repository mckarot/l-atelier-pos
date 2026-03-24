// src/hooks/useDashboardData.test.ts
// Tests unitaires pour le hook useDashboardData

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db } from '../db/database';
import { useDashboardData, useFormattedRevenue, useFormattedTime } from './useDashboardData';
import type { Order } from '../db/types';

// Helper pour créer une commande
function createOrder(overrides: Partial<Order> = {}): Omit<Order, 'id'> {
  const now = Date.now();
  return {
    tableId: 1,
    customerName: 'Test Customer',
    status: 'attente',
    items: [{ name: 'Test Item', quantity: 1 }],
    total: 50,
    createdAt: now,
    ...overrides,
  };
}

describe('useDashboardData', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await db.orders.clear();
  });

  describe('Revenu Quotidien', () => {
    it('calcule le revenu des commandes payées du jour', async () => {
      // Arrange - Ajouter des commandes payées
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
        createdAt: startOfDay + 1000, // Aujourd'hui
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        status: 'paid',
        total: 150,
        createdAt: startOfDay + 2000, // Aujourd'hui
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current!.revenue).toBe(250);
      });
    });

    it('exclut les commandes non payées du revenu', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'preparation',
        total: 100,
        createdAt: startOfDay + 1000,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        status: 'paid',
        total: 150,
        createdAt: startOfDay + 2000,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.revenue).toBe(150);
      });
    });

    it('exclut les commandes des jours précédents', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterday = startOfDay - 86400000; // Hier

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
        createdAt: yesterday, // Hier
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        status: 'paid',
        total: 150,
        createdAt: startOfDay + 1000, // Aujourd'hui
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.revenue).toBe(150);
      });
    });

    it('retourne 0 quand aucune commande payée', async () => {
      // Arrange - Aucune commande

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.revenue).toBe(0);
      });
    });
  });

  describe('Commandes', () => {
    it('compte le nombre de commandes du jour', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: startOfDay + 1000,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: startOfDay + 2000,
      });

      await db.orders.add({
        ...createOrder(),
        id: 3,
        createdAt: startOfDay + 3000,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.ordersCount).toBe(3);
      });
    });

    it('exclut les commandes annulées du comptage', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'annule',
        createdAt: startOfDay + 1000,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        status: 'preparation',
        createdAt: startOfDay + 2000,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.ordersCount).toBe(1);
      });
    });

    it('exclut les commandes des jours précédents', async () => {
      // Arrange
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterday = startOfDay - 86400000;

      await db.orders.add({
        ...createOrder(),
        id: 1,
        createdAt: yesterday,
      });

      await db.orders.add({
        ...createOrder(),
        id: 2,
        createdAt: startOfDay + 1000,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.ordersCount).toBe(1);
      });
    });
  });

  describe('Temps de Préparation Moyen', () => {
    it('calcule le temps moyen de préparation des commandes servies', async () => {
      // Arrange
      const now = Date.now();
      const createdAt = now - 1200000; // 20 minutes ago
      const servedAt = now - 600000; // 10 minutes ago
      const prepTime = 600; // 10 minutes in seconds

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'served',
        createdAt,
        servedAt,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        // Le temps devrait être environ 600 secondes (10 minutes)
        expect(result.current!.avgPrepTime).toBeCloseTo(prepTime, -1);
      });
    });

    it('utilise une valeur par défaut quand aucune commande servie', async () => {
      // Arrange - Aucune commande servie

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        // Valeur par défaut: 18:45 = 1125 secondes
        expect(result.current!.avgPrepTime).toBe(1125);
      });
    });

    it('définit l\'objectif à 15 minutes (900 secondes)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.prepTimeObjective).toBe(900);
      });
    });
  });

  describe('Satisfaction', () => {
    it('retourne un score de satisfaction de 4.8', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.satisfaction).toBe(4.8);
      });
    });

    it('retourne le label "Excellent" pour la satisfaction', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.satisfactionLabel).toBe('Excellent');
      });
    });
  });

  describe('Données Hebdomadaires', () => {
    it('retourne 7 jours de données', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.weeklyData).toHaveLength(7);
      });
    });

    it('inclut tous les jours de la semaine', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        const days = result.current!.weeklyData.map(d => d.day);
        expect(days).toContain('LUN');
        expect(days).toContain('MAR');
        expect(days).toContain('MER');
        expect(days).toContain('JEU');
        expect(days).toContain('VEN');
        expect(days).toContain('SAM');
        expect(days).toContain('DIM');
      });
    });

    it('marque le jour actuel avec isCurrentDay', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        const currentDays = result.current!.weeklyData.filter(d => d.isCurrentDay);
        expect(currentDays).toHaveLength(1);
      });
    });
  });

  describe('Flux Live', () => {
    it('génère des événements de flux live', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        expect(result.current!.liveEvents.length).toBeGreaterThan(0);
      });
    });

    it('inclut des événements de type payment', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        const paymentEvents = result.current!.liveEvents.filter(e => e.type === 'payment');
        expect(paymentEvents.length).toBeGreaterThan(0);
      });
    });

    it('inclut des événements de type order', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'pret',
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        const orderEvents = result.current!.liveEvents.filter(e => e.type === 'order');
        expect(orderEvents.length).toBeGreaterThan(0);
      });
    });

    it('inclut des événements de type cancellation', async () => {
      // Arrange
      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'annule',
      });

      // Act
      const { result } = renderHook(() => useDashboardData());

      // Assert
      await waitFor(() => {
        const cancellationEvents = result.current!.liveEvents.filter(e => e.type === 'cancellation');
        expect(cancellationEvents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Réactivité', () => {
    it('met à jour les données quand une nouvelle commande est ajoutée', async () => {
      // Arrange
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const initialRevenue = result.current!.revenue;

      // Act - Ajouter une commande payée
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      await db.orders.add({
        ...createOrder(),
        id: 1,
        status: 'paid',
        total: 100,
        createdAt: startOfDay + 1000,
      });

      // Assert
      await waitFor(() => {
        expect(result.current!.revenue).toBe(initialRevenue + 100);
      });
    });
  });
});

describe('useFormattedRevenue', () => {
  it('formate le revenu en euros sans décimales', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedRevenue(2485));

    // Assert - Le format peut utiliser un espace insécable (\u202f)
    expect(result.current).toMatch(/2[\u0020\u202f]485\s*€/);
  });

  it('gère undefined', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedRevenue(undefined));

    // Assert
    expect(result.current).toMatch(/0\s*€/);
  });

  it('gère les valeurs décimales', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedRevenue(2485.67));

    // Assert
    expect(result.current).toMatch(/2[\u0020\u202f]486\s*€/); // Arrondi
  });

  it('gère zéro', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedRevenue(0));

    // Assert
    expect(result.current).toMatch(/0\s*€/);
  });
});

describe('useFormattedTime', () => {
  it('formate les secondes en MM:SS', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedTime(125)); // 2 minutes 5 secondes

    // Assert
    expect(result.current).toBe('02:05');
  });

  it('gère les minutes exactes', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedTime(900)); // 15 minutes

    // Assert
    expect(result.current).toBe('15:00');
  });

  it('gère undefined', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedTime(undefined));

    // Assert
    expect(result.current).toBe('00:00');
  });

  it('gère zéro', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedTime(0));

    // Assert
    expect(result.current).toBe('00:00');
  });

  it('pad les secondes avec un zéro', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFormattedTime(61)); // 1 minute 1 seconde

    // Assert
    expect(result.current).toBe('01:01');
  });
});
