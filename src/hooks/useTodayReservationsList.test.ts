// src/hooks/useTodayReservationsList.test.ts
// Tests unitaires pour le hook useTodayReservationsList

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTodayReservationsList } from './useTodayReservationsList';
import { db } from '../db/database';
import type { Reservation } from '../db/types';

describe('useTodayReservationsList', () => {
  const today = new Date().toISOString().split('T')[0];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Nettoyer les réservations avant chaque test
    await db.reservations.clear();
  });

  it('retourne un tableau vide au départ', async () => {
    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('retourne les réservations du jour', async () => {
    // Ajouter des réservations de test
    const testReservations: Reservation[] = [
      {
        id: 1,
        customerName: 'Jean Dupont',
        email: 'jean@email.com',
        phone: '0612345678',
        date: today,
        time: '19:30',
        guests: 4,
        status: 'confirme',
        tableId: 6,
        notes: 'Anniversaire',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-001',
      },
      {
        id: 2,
        customerName: 'Marie Martin',
        email: 'marie@email.com',
        phone: '0789123456',
        date: today,
        time: '20:00',
        guests: 2,
        status: 'attente',
        notes: 'Près de la fenêtre',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-002',
      },
    ];

    await db.reservations.bulkPut(testReservations);

    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(2);
    expect(result.current.reservations[0].customerName).toBe('Jean Dupont');
    expect(result.current.reservations[1].customerName).toBe('Marie Martin');
  });

  it('ne retourne que les réservations du jour', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const testReservations: Reservation[] = [
      {
        id: 1,
        customerName: 'Hier',
        email: 'hier@email.com',
        phone: '0612345678',
        date: yesterday,
        time: '19:30',
        guests: 4,
        status: 'confirme',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-001',
      },
      {
        id: 2,
        customerName: "Aujourd'hui",
        email: 'aujourd@email.com',
        phone: '0789123456',
        date: today,
        time: '20:00',
        guests: 2,
        status: 'attente',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-002',
      },
      {
        id: 3,
        customerName: 'Demain',
        email: 'demain@email.com',
        phone: '0698765432',
        date: tomorrow,
        time: '21:00',
        guests: 3,
        status: 'confirme',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-003',
      },
    ];

    await db.reservations.bulkPut(testReservations);

    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(1);
    expect(result.current.reservations[0].customerName).toBe("Aujourd'hui");
  });

  it('trie les réservations par heure', async () => {
    const testReservations: Reservation[] = [
      {
        id: 1,
        customerName: '20:00',
        email: 'test1@email.com',
        phone: '0612345678',
        date: today,
        time: '20:00',
        guests: 4,
        status: 'confirme',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-001',
      },
      {
        id: 2,
        customerName: '19:30',
        email: 'test2@email.com',
        phone: '0789123456',
        date: today,
        time: '19:30',
        guests: 2,
        status: 'attente',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-002',
      },
      {
        id: 3,
        customerName: '21:00',
        email: 'test3@email.com',
        phone: '0698765432',
        date: today,
        time: '21:00',
        guests: 3,
        status: 'confirme',
        createdAt: Date.now(),
        referenceNumber: 'RES-1234567890-003',
      },
    ];

    await db.reservations.bulkPut(testReservations);

    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(3);
    expect(result.current.reservations[0].time).toBe('19:30');
    expect(result.current.reservations[1].time).toBe('20:00');
    expect(result.current.reservations[2].time).toBe('21:00');
  });

  it('fournit une fonction refresh', async () => {
    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('rafraîchit les données après un ajout', async () => {
    const { result } = renderHook(() => useTodayReservationsList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(0);

    // Ajouter une réservation
    await db.reservations.add({
      id: 1,
      customerName: 'Nouveau Client',
      email: 'nouveau@email.com',
      phone: '0612345678',
      date: today,
      time: '19:30',
      guests: 4,
      status: 'confirme',
      createdAt: Date.now(),
      referenceNumber: 'RES-1234567890-001',
    });

    // Rafraîchir
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.reservations).toHaveLength(1);
    });

    expect(result.current.reservations[0].customerName).toBe('Nouveau Client');
  });
});

// Helper pour act dans les tests
const act = async (fn: () => Promise<void>) => {
  await fn();
};
