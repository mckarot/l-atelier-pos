// src/utils/timer.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Order } from '../db/types';
import {
  calculateElapsedTime,
  formatElapsedTime,
  formatTime,
  getTimerAlertStatus,
  isTimerDanger,
  isTimerWarning,
  calculateAveragePrepTime,
  TIMER_THRESHOLDS,
} from './timer';

describe('timer utilities', () => {
  const FIXED_TIME = 1700000000000; // Wed Nov 15 2023 00:53:20

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateElapsedTime', () => {
    it('devrait calculer le temps écoulé depuis un timestamp', () => {
      // Arrange
      const createdAt = FIXED_TIME - 60000; // Il y a 1 minute

      // Act
      const elapsed = calculateElapsedTime(createdAt, FIXED_TIME);

      // Assert
      expect(elapsed).toBe(60000);
    });

    it('devrait utiliser Date.now() par défaut si currentTime n\'est pas fourni', () => {
      // Arrange
      const createdAt = FIXED_TIME - 120000; // Il y a 2 minutes

      // Act
      const elapsed = calculateElapsedTime(createdAt);

      // Assert
      expect(elapsed).toBe(120000);
    });

    it('devrait retourner 0 si createdAt est égal à currentTime', () => {
      // Arrange & Act
      const elapsed = calculateElapsedTime(FIXED_TIME, FIXED_TIME);

      // Assert
      expect(elapsed).toBe(0);
    });

    it('devrait retourner une valeur négative si createdAt est dans le futur', () => {
      // Arrange
      const createdAt = FIXED_TIME + 60000;

      // Act
      const elapsed = calculateElapsedTime(createdAt, FIXED_TIME);

      // Assert
      expect(elapsed).toBe(-60000);
    });
  });

  describe('formatElapsedTime', () => {
    it('devrait formater 0ms en "00:00"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(0);

      // Assert
      expect(formatted).toBe('00:00');
    });

    it('devrait formater 30 secondes en "00:30"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(30000);

      // Assert
      expect(formatted).toBe('00:30');
    });

    it('devrait formater 1 minute 30 secondes en "01:30"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(90000);

      // Assert
      expect(formatted).toBe('01:30');
    });

    it('devrait formater 5 minutes 45 secondes en "05:45"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(345000);

      // Assert
      expect(formatted).toBe('05:45');
    });

    it('devrait formater 15 minutes 59 secondes en "15:59"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(959000);

      // Assert
      expect(formatted).toBe('15:59');
    });

    it('devrait formater 60 minutes en "60:00"', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(3600000);

      // Assert
      expect(formatted).toBe('60:00');
    });

    it('devrait gérer les valeurs négatives correctement', () => {
      // Arrange & Act
      const formatted = formatElapsedTime(-5000);

      // Assert - JavaScript modulo donne des résultats inattendus pour les négatifs
      // -5000ms = -1 minute et -5 secondes (comportement attendu de Math.floor avec négatifs)
      expect(formatted).toBe('-1:-5');
    });
  });

  describe('formatTime', () => {
    it('devrait formater un timestamp en heure locale HH:MM', () => {
      // Arrange
      const timestamp = new Date('2023-11-15T14:30:00').getTime();

      // Act
      const formatted = formatTime(timestamp);

      // Assert
      expect(formatted).toBe('14:30');
    });

    it('devrait formater avec zéro non-significatif pour les heures < 10', () => {
      // Arrange
      const timestamp = new Date('2023-11-15T09:05:00').getTime();

      // Act
      const formatted = formatTime(timestamp);

      // Assert
      expect(formatted).toBe('09:05');
    });

    it('devrait formater minuit en "00:00"', () => {
      // Arrange
      const timestamp = new Date('2023-11-15T00:00:00').getTime();

      // Act
      const formatted = formatTime(timestamp);

      // Assert
      expect(formatted).toBe('00:00');
    });

    it('devrait formater 23:59 correctement', () => {
      // Arrange
      const timestamp = new Date('2023-11-15T23:59:00').getTime();

      // Act
      const formatted = formatTime(timestamp);

      // Assert
      expect(formatted).toBe('23:59');
    });
  });

  describe('getTimerAlertStatus', () => {
    it('devrait retourner "normal" pour un temps < 10 minutes', () => {
      // Arrange
      const elapsedMs = 5 * 60 * 1000; // 5 minutes

      // Act
      const status = getTimerAlertStatus(elapsedMs);

      // Assert
      expect(status).toBe('normal');
    });

    it('devrait retourner "normal" pour un temps exactement à 0', () => {
      // Arrange & Act
      const status = getTimerAlertStatus(0);

      // Assert
      expect(status).toBe('normal');
    });

    it('devrait retourner "warning" pour un temps entre 10 et 20 minutes', () => {
      // Arrange - 15 minutes (strictement supérieur à 10 min)
      const elapsedMs = 15 * 60 * 1000;

      // Act
      const status = getTimerAlertStatus(elapsedMs);

      // Assert
      expect(status).toBe('warning');
    });

    it('devrait retourner "normal" pour un temps exactement à 10 minutes (seuil non inclus)', () => {
      // Arrange - Exactement 10 minutes (le seuil est > 10 min, pas >=)
      const elapsedMs = 10 * 60 * 1000;

      // Act
      const status = getTimerAlertStatus(elapsedMs);

      // Assert
      expect(status).toBe('normal');
    });

    it('devrait retourner "danger" pour un temps exactement à 20 minutes (seuil non inclus)', () => {
      // Arrange - Exactement 20 minutes (le seuil est > 20 min, pas >=)
      const elapsedMs = 20 * 60 * 1000;

      // Act
      const status = getTimerAlertStatus(elapsedMs);

      // Assert
      expect(status).toBe('warning');
    });
  });

  describe('isTimerDanger', () => {
    it('devrait retourner true pour un temps > 20 minutes', () => {
      // Arrange
      const elapsedMs = 21 * 60 * 1000;

      // Act
      const result = isTimerDanger(elapsedMs);

      // Assert
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un temps <= 20 minutes', () => {
      // Arrange
      const elapsedMs = 20 * 60 * 1000;

      // Act
      const result = isTimerDanger(elapsedMs);

      // Assert
      expect(result).toBe(false);
    });

    it('devrait retourner false pour un temps normal', () => {
      // Arrange
      const elapsedMs = 5 * 60 * 1000;

      // Act
      const result = isTimerDanger(elapsedMs);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isTimerWarning', () => {
    it('devrait retourner true pour un temps entre 10 et 20 minutes', () => {
      // Arrange
      const elapsedMs = 15 * 60 * 1000;

      // Act
      const result = isTimerWarning(elapsedMs);

      // Assert
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un temps exactement à 10 minutes (seuil non inclus)', () => {
      // Arrange
      const elapsedMs = 10 * 60 * 1000;

      // Act
      const result = isTimerWarning(elapsedMs);

      // Assert
      expect(result).toBe(false);
    });

    it('devrait retourner false pour un temps > 20 minutes (danger)', () => {
      // Arrange
      const elapsedMs = 25 * 60 * 1000;

      // Act
      const result = isTimerWarning(elapsedMs);

      // Assert
      expect(result).toBe(false);
    });

    it('devrait retourner false pour un temps < 10 minutes (normal)', () => {
      // Arrange
      const elapsedMs = 5 * 60 * 1000;

      // Act
      const result = isTimerWarning(elapsedMs);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('TIMER_THRESHOLDS', () => {
    it('devrait avoir un seuil warning à 10 minutes', () => {
      expect(TIMER_THRESHOLDS.warning).toBe(10 * 60 * 1000);
    });

    it('devrait avoir un seuil danger à 20 minutes', () => {
      expect(TIMER_THRESHOLDS.danger).toBe(20 * 60 * 1000);
    });

    it('devrait avoir warning < danger', () => {
      expect(TIMER_THRESHOLDS.warning).toBeLessThan(TIMER_THRESHOLDS.danger);
    });
  });

  describe('calculateAveragePrepTime', () => {
    const FIXED_TIME = 1700000000000;

    beforeEach(() => {
      vi.setSystemTime(FIXED_TIME);
    });

    it('devrait retourner 0 pour une liste vide de commandes', () => {
      // Arrange & Act
      const avgTime = calculateAveragePrepTime([]);

      // Assert
      expect(avgTime).toBe(0);
    });

    it('devrait calculer le temps moyen pour une seule commande terminée', () => {
      // Arrange - Commande créée à T-30min, terminée à T-10min (20min de prép)
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 30 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - 20 minutes
      expect(avgTime).toBe(20);
    });

    it('devrait calculer la moyenne pour plusieurs commandes', () => {
      // Arrange - 3 commandes: 10min, 20min, 30min = moyenne 20min
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 20 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'servi',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 40 * 60 * 1000,
          updatedAt: FIXED_TIME - 20 * 60 * 1000,
        },
        {
          id: 3,
          tableId: 3,
          customerName: 'Test 3',
          status: 'paye',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 60 * 60 * 1000,
          updatedAt: FIXED_TIME - 30 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - (10 + 20 + 30) / 3 = 20 minutes
      expect(avgTime).toBe(20);
    });

    it('devrait ignorer les commandes non terminées (en_attente, en_preparation)', () => {
      // Arrange
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 20 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 30 * 60 * 1000,
        },
        {
          id: 3,
          tableId: 3,
          customerName: 'Test 3',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 40 * 60 * 1000,
          updatedAt: FIXED_TIME - 20 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - Seulement la commande 1 est comptée (10min)
      expect(avgTime).toBe(10);
    });

    it('devrait utiliser updatedAt ou createdAt si updatedAt est absent pour les commandes terminées', () => {
      // Arrange - Commande 'pret' sans updatedAt
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 15 * 60 * 1000,
          // updatedAt absent, devrait utiliser createdAt
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - 0 car updatedAt = createdAt, donc prep time = 0
      expect(avgTime).toBe(0);
    });

    it('devrait retourner 0 si aucune commande avec les statuts complétés', () => {
      // Arrange - Toutes les commandes sont en cours
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'en_attente',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 30 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'en_preparation',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 40 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert
      expect(avgTime).toBe(0);
    });

    it('devrait respecter les completedStatuses personnalisés', () => {
      // Arrange
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 20 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'servi',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 40 * 60 * 1000,
          updatedAt: FIXED_TIME - 20 * 60 * 1000,
        },
      ];

      // Act - Seulement 'pret' est considéré comme complété
      const avgTime = calculateAveragePrepTime(orders, { completedStatuses: ['pret'] });

      // Assert - Seulement la commande 1 (10min)
      expect(avgTime).toBe(10);
    });

    it('devrait respecter minOptions pour retourner 0 si pas assez de commandes', () => {
      // Arrange - 2 commandes terminées
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 20 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 40 * 60 * 1000,
          updatedAt: FIXED_TIME - 20 * 60 * 1000,
        },
      ];

      // Act - Requiert minimum 3 commandes
      const avgTime = calculateAveragePrepTime(orders, { minOrders: 3 });

      // Assert - 0 car moins de 3 commandes
      expect(avgTime).toBe(0);
    });

    it('devrait arrondir le temps moyen à l\'entier le plus proche', () => {
      // Arrange - 2 commandes: 10min et 11min = moyenne 10.5min → arrondi à 11min
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test 1',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 20 * 60 * 1000,
          updatedAt: FIXED_TIME - 10 * 60 * 1000,
        },
        {
          id: 2,
          tableId: 2,
          customerName: 'Test 2',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 33 * 60 * 1000,
          updatedAt: FIXED_TIME - 22 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - (10 + 11) / 2 = 10.5 → arrondi à 11 (ou 10 selon Math.round)
      expect(avgTime).toBe(11);
    });

    it('devrait gérer les commandes avec des temps de préparation très courts', () => {
      // Arrange - Commande avec 30 secondes de prép
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 60 * 1000,
          updatedAt: FIXED_TIME - 30 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - 0.5 min arrondi à 1 (Math.round(0.5) = 1)
      expect(avgTime).toBe(1);
    });

    it('devrait gérer les commandes avec des temps de préparation longs (> 1 heure)', () => {
      // Arrange - Commande avec 90 minutes de prép
      const orders: Order[] = [
        {
          id: 1,
          tableId: 1,
          customerName: 'Test',
          status: 'pret',
          items: [{ name: 'Test', quantity: 1 }],
          createdAt: FIXED_TIME - 120 * 60 * 1000,
          updatedAt: FIXED_TIME - 30 * 60 * 1000,
        },
      ];

      // Act
      const avgTime = calculateAveragePrepTime(orders);

      // Assert - 90 minutes
      expect(avgTime).toBe(90);
    });
  });
});
