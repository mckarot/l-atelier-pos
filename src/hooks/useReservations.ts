// src/hooks/useReservations.ts
// Hooks Firestore pour la gestion des réservations

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  Reservation,
  ReservationStatus,
  CreateReservationInput,
} from '../firebase/types';

/**
 * Récupère toutes les réservations
 * Utilise un snapshot temps réel pour les mises à jour automatiques
 * @returns Toutes les réservations triées par date et heure
 */
export function useAllReservations(): {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
} {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'reservations'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAllReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { reservations, isLoading, error };
}

/**
 * Récupère les réservations pour une date spécifique
 * @param date - Date au format YYYY-MM-DD
 * @returns Les réservations pour cette date
 */
export function useReservationsByDate(
  date: string
): { reservations: Reservation[]; isLoading: boolean; error: Error | null } {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', date),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useReservationsByDate] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [date]);

  return { reservations, isLoading, error };
}

/**
 * Récupère les réservations du jour courant
 * @returns Les réservations du jour
 */
export function useTodayReservations(): {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
} {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', today),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useTodayReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { reservations, isLoading, error };
}

/**
 * Récupère les réservations par statut
 * @param status - Statut à filtrer
 * @returns Les réservations avec ce statut
 */
export function useReservationsByStatus(
  status: ReservationStatus
): { reservations: Reservation[]; isLoading: boolean; error: Error | null } {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'reservations'),
      where('status', '==', status),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );
        setReservations(fetchedReservations);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useReservationsByStatus] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { reservations, isLoading, error };
}

/**
 * Récupère une réservation par son ID
 * @param reservationId - ID de la réservation
 * @returns La réservation ou null
 */
export function useReservation(
  reservationId: string | null
): { reservation: Reservation | null; isLoading: boolean; error: Error | null } {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setReservation(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const reservationRef = doc(db, 'reservations', reservationId);

    const unsubscribe = onSnapshot(
      reservationRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setReservation({
            id: docSnap.id,
            ...docSnap.data(),
          } as Reservation);
        } else {
          setReservation(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[useReservation] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [reservationId]);

  return { reservation, isLoading, error };
}

/**
 * Crée une nouvelle réservation
 * @param input - Données de création
 * @returns ID de la réservation créée
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<string> {
  try {
    const reservationData = {
      ...input,
      status: input.status || 'attente',
      createdAt: Timestamp.now(),
      referenceNumber:
        input.referenceNumber ||
        `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const docRef = await addDoc(collection(db, 'reservations'), reservationData);
    return docRef.id;
  } catch (error) {
    console.error('[createReservation] Error:', error);
    throw error;
  }
}

/**
 * Met à jour une réservation existante
 * @param reservationId - ID de la réservation
 * @param updates - Données à mettre à jour
 */
export async function updateReservation(
  reservationId: string,
  updates: Partial<Reservation>
): Promise<void> {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateReservation] Error:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une réservation
 * @param reservationId - ID de la réservation
 * @param status - Nouveau statut
 */
export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus
): Promise<void> {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateReservationStatus] Error:', error);
    throw error;
  }
}

/**
 * Annule une réservation
 * @param reservationId - ID de la réservation
 */
export async function cancelReservation(reservationId: string): Promise<void> {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'annule',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[cancelReservation] Error:', error);
    throw error;
  }
}

/**
 * Supprime une réservation
 * @param reservationId - ID de la réservation
 */
export async function deleteReservation(reservationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reservations', reservationId));
  } catch (error) {
    console.error('[deleteReservation] Error:', error);
    throw error;
  }
}

/**
 * Récupère les réservations à venir (30 prochaines minutes)
 * @returns Les réservations à venir
 */
export function useUpcomingArrivals(
  limit = 5
): { reservations: Reservation[]; isLoading: boolean; error: Error | null } {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const q = query(
      collection(db, 'reservations'),
      where('date', '==', today),
      where('status', '==', 'confirme'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allReservations = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Reservation
        );

        const upcoming = allReservations
          .filter((r) => r.time >= currentTime)
          .slice(0, limit);

        setReservations(upcoming);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useUpcomingArrivals] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit]);

  return { reservations, isLoading, error };
}
