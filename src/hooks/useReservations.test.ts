// src/hooks/useReservations.test.ts
// Tests unitaires pour les hooks de gestion des réservations

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { seedDatabase } from '../db/database';
import { db } from '../db/database';
import type { Reservation } from '../db/types';

// Import des hooks à tester
import {
  useAllReservations,
  useReservationsByDate,
  useTodayReservations,
  useReservationsByStatus,
  useReservation,
  createReservation,
  updateReservationStatus,
  cancelReservation,
  useUpcomingReservations,
} from './useReservations';

describe('useReservations Hooks', () => {
  beforeEach(async () => {
    // Seed des données avant chaque test
    await seedDatabase();
  });

  describe('useAllReservations', () => {
    it('devrait retourner toutes les 2 réservations créées par le seed', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(2);
      });
    });

    it('devrait retourner les réservations triées par date puis par heure', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAllReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      for (let i = 1; i < reservations.length; i++) {
        const prev = reservations[i - 1];
        const curr = reservations[i];
        
        const dateCompare = prev.date.localeCompare(curr.date);
        if (dateCompare === 0) {
          // Même date, vérifier l'heure
          expect(prev.time.localeCompare(curr.time)).toBeLessThanOrEqual(0);
        } else {
          expect(dateCompare).toBeLessThanOrEqual(0);
        }
      }
    });

    it('devrait retourner un tableau vide quand il n\'y a pas de réservations', async () => {
      // Arrange - Vider les réservations
      await db.reservations.clear();

      // Act
      const { result } = renderHook(() => useAllReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });
  });

  describe('useReservationsByDate', () => {
    it('devrait retourner les réservations pour la date du jour', async () => {
      // Arrange - La date du jour
      const today = new Date().toISOString().split('T')[0];

      // Act
      const { result } = renderHook(() => useReservationsByDate(today));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      expect(reservations.length).toBe(2); // Le seed crée 2 réservations pour aujourd'hui
      reservations.forEach(reservation => {
        expect(reservation.date).toBe(today);
      });
    });

    it('devrait retourner les réservations triées par heure', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];

      // Act
      const { result } = renderHook(() => useReservationsByDate(today));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      for (let i = 1; i < reservations.length; i++) {
        expect(reservations[i - 1].time.localeCompare(reservations[i].time)).toBeLessThanOrEqual(0);
      }
    });

    it('devrait retourner un tableau vide pour une date sans réservations', async () => {
      // Arrange - Une date future
      const futureDate = '2099-12-31';

      // Act
      const { result } = renderHook(() => useReservationsByDate(futureDate));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });

    it('devrait retourner les réservations pour une date spécifique', async () => {
      // Arrange - Ajouter une réservation pour une date spécifique
      const specificDate = '2026-06-15';
      await db.reservations.add({
        customerName: 'Test Customer',
        date: specificDate,
        time: '20:00',
        guests: 4,
        status: 'confirme',
      });

      // Act
      const { result } = renderHook(() => useReservationsByDate(specificDate));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      expect(reservations.length).toBe(1);
      expect(reservations[0].date).toBe(specificDate);
    });
  });

  describe('useTodayReservations', () => {
    it('devrait retourner les réservations du jour courant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTodayReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      const today = new Date().toISOString().split('T')[0];
      
      expect(reservations.length).toBe(2);
      reservations.forEach(reservation => {
        expect(reservation.date).toBe(today);
      });
    });

    it('devrait retourner un tableau vide s\'il n\'y a pas de réservations aujourd\'hui', async () => {
      // Arrange - Vider les réservations
      await db.reservations.clear();

      // Act
      const { result } = renderHook(() => useTodayReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });

    it('devrait retourner les réservations triées par heure', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useTodayReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      for (let i = 1; i < reservations.length; i++) {
        expect(reservations[i - 1].time.localeCompare(reservations[i].time)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('useReservationsByStatus', () => {
    it('devrait retourner les réservations avec le statut "confirme"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useReservationsByStatus('confirme'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      expect(reservations.length).toBeGreaterThan(0);
      reservations.forEach(reservation => {
        expect(reservation.status).toBe('confirme');
      });
    });

    it('devrait retourner les réservations avec le statut "en_attente"', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useReservationsByStatus('en_attente'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      expect(reservations.length).toBeGreaterThan(0);
      reservations.forEach(reservation => {
        expect(reservation.status).toBe('en_attente');
      });
    });

    it('devrait retourner un tableau vide pour un statut sans réservations', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useReservationsByStatus('annule'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current).toHaveLength(0);
      });
    });

    it('devrait retourner les réservations triées par date puis heure', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useReservationsByStatus('confirme'));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      for (let i = 1; i < reservations.length; i++) {
        const prev = reservations[i - 1];
        const curr = reservations[i];
        
        const dateCompare = prev.date.localeCompare(curr.date);
        if (dateCompare === 0) {
          expect(prev.time.localeCompare(curr.time)).toBeLessThanOrEqual(0);
        } else {
          expect(dateCompare).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('useReservation', () => {
    it('devrait retourner une réservation par son ID', async () => {
      // Arrange - Récupérer la première réservation
      const firstReservation = await db.reservations.orderBy("id").first();
      expect(firstReservation).toBeDefined();

      // Act
      const { result } = renderHook(() => useReservation(firstReservation!.id));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.id).toBe(firstReservation!.id);
      expect(result.current!.customerName).toBe(firstReservation!.customerName);
    });

    it('devrait retourner les bonnes informations pour la réservation "Famille Martin"', async () => {
      // Arrange - Trouver la réservation par ID (première réservation du seed)
      const martinReservation = await db.reservations.orderBy('id').first();
      expect(martinReservation).toBeDefined();

      // Act
      const { result } = renderHook(() => useReservation(martinReservation!.id));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current!.customerName).toBe('Famille Martin');
      expect(result.current!.email).toBe('martin@email.com');
      expect(result.current!.guests).toBe(4);
    });

    it('devrait retourner undefined pour un ID inexistant', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useReservation(999));

      // Assert
      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });
  });

  describe('createReservation', () => {
    it('devrait créer une nouvelle réservation avec succès', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const newReservationData = {
        customerName: 'Nouveau Client',
        email: 'nouveau@client.com',
        phone: '06 11 22 33 44',
        date: today,
        time: '21:00',
        guests: 3,
        status: 'en_attente' as const,
      };

      // Act
      const reservationId = await createReservation(newReservationData);

      // Assert
      expect(reservationId).toBeDefined();
      expect(typeof reservationId).toBe('number');

      const createdReservation = await db.reservations.get(reservationId);
      expect(createdReservation).toBeDefined();
      expect(createdReservation!.customerName).toBe('Nouveau Client');
      expect(createdReservation!.email).toBe('nouveau@client.com');
      expect(createdReservation!.guests).toBe(3);
      expect(createdReservation!.status).toBe('en_attente');
    });

    it('devrait créer une réservation avec des notes', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const newReservationData = {
        customerName: 'Client Notes',
        date: today,
        time: '19:30',
        guests: 2,
        status: 'confirme' as const,
        notes: 'Anniversaire - prévoir un gâteau',
      };

      // Act
      const reservationId = await createReservation(newReservationData);

      // Assert
      const createdReservation = await db.reservations.get(reservationId);
      expect(createdReservation!.notes).toBe('Anniversaire - prévoir un gâteau');
    });

    it('devrait créer une réservation avec un tableId', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const newReservationData = {
        customerName: 'Client Table',
        date: today,
        time: '20:00',
        guests: 4,
        status: 'confirme' as const,
        tableId: 6,
      };

      // Act
      const reservationId = await createReservation(newReservationData);

      // Assert
      const createdReservation = await db.reservations.get(reservationId);
      expect(createdReservation!.tableId).toBe(6);
    });

    it('devrait créer une réservation sans email ni phone', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const newReservationData = {
        customerName: 'Client Anonyme',
        date: today,
        time: '19:00',
        guests: 2,
        status: 'en_attente' as const,
      };

      // Act
      const reservationId = await createReservation(newReservationData);

      // Assert
      const createdReservation = await db.reservations.get(reservationId);
      expect(createdReservation!.customerName).toBe('Client Anonyme');
      expect(createdReservation!.email).toBeUndefined();
      expect(createdReservation!.phone).toBeUndefined();
    });
  });

  describe('updateReservationStatus', () => {
    it('devrait mettre à jour le statut d\'une réservation', async () => {
      // Arrange - Récupérer une réservation
      const reservation = await db.reservations.orderBy("id").first();
      expect(reservation).toBeDefined();

      // Act
      await updateReservationStatus(reservation!.id, 'arrive');

      // Assert
      const updatedReservation = await db.reservations.get(reservation!.id);
      expect(updatedReservation!.status).toBe('arrive');
    });

    it('devrait changer le statut de "en_attente" à "confirme"', async () => {
      // Arrange
      const reservation = await db.reservations.where('status').equals('en_attente').first();
      expect(reservation).toBeDefined();

      // Act
      await updateReservationStatus(reservation!.id, 'confirme');

      // Assert
      const updatedReservation = await db.reservations.get(reservation!.id);
      expect(updatedReservation!.status).toBe('confirme');
    });

    it('devrait changer le statut de "confirme" à "arrive"', async () => {
      // Arrange
      const reservation = await db.reservations.where('status').equals('confirme').first();
      expect(reservation).toBeDefined();

      // Act
      await updateReservationStatus(reservation!.id, 'arrive');

      // Assert
      const updatedReservation = await db.reservations.get(reservation!.id);
      expect(updatedReservation!.status).toBe('arrive');
    });
  });

  describe('cancelReservation', () => {
    it('devrait annuler une réservation en changeant le statut', async () => {
      // Arrange
      const reservation = await db.reservations.orderBy("id").first();
      expect(reservation).toBeDefined();

      // Act
      await cancelReservation(reservation!.id);

      // Assert
      const cancelledReservation = await db.reservations.get(reservation!.id);
      expect(cancelledReservation!.status).toBe('annule');
    });

    it('devrait pouvoir annuler une réservation confirmée', async () => {
      // Arrange
      const reservation = await db.reservations.where('status').equals('confirme').first();
      expect(reservation).toBeDefined();

      // Act
      await cancelReservation(reservation!.id);

      // Assert
      const cancelledReservation = await db.reservations.get(reservation!.id);
      expect(cancelledReservation!.status).toBe('annule');
    });

    it('devrait pouvoir annuler une réservation en attente', async () => {
      // Arrange
      const reservation = await db.reservations.where('status').equals('en_attente').first();
      expect(reservation).toBeDefined();

      // Act
      await cancelReservation(reservation!.id);

      // Assert
      const cancelledReservation = await db.reservations.get(reservation!.id);
      expect(cancelledReservation!.status).toBe('annule');
    });
  });

  describe('useUpcomingReservations', () => {
    it('devrait retourner les réservations à venir (aujourd\'hui et futur)', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useUpcomingReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      const today = new Date().toISOString().split('T')[0];

      reservations.forEach(reservation => {
        expect(reservation.date >= today).toBe(true);
        expect(reservation.status).not.toBe('annule');
      });
    });

    it('devrait exclure les réservations annulées', async () => {
      // Arrange - Annuler une réservation
      const reservation = await db.reservations.orderBy("id").first();
      expect(reservation).toBeDefined();
      await cancelReservation(reservation!.id);

      // Act
      const { result } = renderHook(() => useUpcomingReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      const cancelledReservation = reservations.find(r => r.id === reservation!.id);
      expect(cancelledReservation).toBeUndefined();
    });

    it('devrait retourner les réservations triées par date puis heure', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useUpcomingReservations());

      // Assert
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const reservations = result.current!;
      for (let i = 1; i < reservations.length; i++) {
        const prev = reservations[i - 1];
        const curr = reservations[i];
        
        const dateCompare = prev.date.localeCompare(curr.date);
        if (dateCompare === 0) {
          expect(prev.time.localeCompare(curr.time)).toBeLessThanOrEqual(0);
        } else {
          expect(dateCompare).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});
