// src/hooks/useOrders.ts
// Hooks Firestore pour la gestion des commandes

import { useState, useEffect, useCallback } from 'react';
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
  Order,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderInput,
} from '../firebase/types';

/**
 * Récupère toutes les commandes actives (non payées et non annulées)
 * Utilise un snapshot temps réel pour les mises à jour automatiques
 * @returns Les commandes actives triées par createdAt décroissant
 */
export function useActiveOrders(): {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
} {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'orders'),
      where('status', 'not-in', ['paid', 'annule']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Order
        );
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useActiveOrders] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { orders, isLoading, error };
}

/**
 * Récupère toutes les commandes d'une table spécifique
 * @param tableId - Numéro de la table
 * @returns Les commandes de la table
 */
export function useOrdersByTable(
  tableId: number
): { orders: Order[]; isLoading: boolean; error: Error | null } {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'orders'),
      where('tableId', '==', tableId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Order
        );
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useOrdersByTable] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tableId]);

  return { orders, isLoading, error };
}

/**
 * Récupère une commande par son ID
 * @param orderId - ID de la commande
 * @returns La commande ou null
 */
export function useOrder(
  orderId: string | null
): { order: Order | null; isLoading: boolean; error: Error | null } {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const orderRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          setOrder(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[useOrder] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  return { order, isLoading, error };
}

/**
 * Récupère toutes les commandes triées par statut (pour KDS)
 * @returns Les commandes groupées par statut
 */
export function useKDSOrders(): {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
} {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'orders'),
      where('status', 'not-in', ['served', 'paid', 'annule']),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Order
        );
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useKDSOrders] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { orders, isLoading, error };
}

/**
 * Crée une nouvelle commande en base
 * @param input - Données de création (sans id, createdAt, updatedAt)
 * @returns ID de la commande créée
 */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  try {
    const orderData = {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  } catch (error) {
    console.error('[createOrder] Error:', error);
    throw error;
  }
}

/**
 * Met à jour une commande existante
 * @param input - Données de mise à jour (doit inclure id)
 */
export async function updateOrderStatus(input: UpdateOrderInput): Promise<void> {
  try {
    const { id, ...updates } = input;
    const orderRef = doc(db, 'orders', id);

    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[updateOrderStatus] Error:', error);
    throw error;
  }
}

/**
 * Supprime une commande (soft delete via statut)
 * @param orderId - ID de la commande
 */
export async function cancelOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'annule',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[cancelOrder] Error:', error);
    throw error;
  }
}

/**
 * Marque une commande comme servie
 * @param orderId - ID de la commande
 */
export async function markOrderAsServed(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'served',
      servedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('[markOrderAsServed] Error:', error);
    throw error;
  }
}

/**
 * Récupère les commandes récentes pour le dashboard
 * @param limit - Nombre maximum de commandes
 * @returns Les commandes récentes
 */
export function useRecentOrders(
  limit = 10
): { orders: Order[]; isLoading: boolean; error: Error | null } {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Order
        );
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useRecentOrders] Error:', err);
        setError(err instanceof Error ? err : new Error('Erreur Firestore'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit]);

  return { orders, isLoading, error };
}
