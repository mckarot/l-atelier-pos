// src/hooks/useSyncStatus.ts
// Hook personnalisé pour détecter l'état de synchronisation et la connexion réseau

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getDb } from '../firebase/config';

export type SyncStatus = 'connected' | 'disconnected' | 'syncing';

export interface UseSyncStatusReturn {
  status: SyncStatus;
  isOnline: boolean;
  lastSync: Date | null;
  lastMutationAt: Date | null;
}

/**
 * Hook pour surveiller l'état de synchronisation
 * - Détecte la connexion réseau via window.online/offline
 * - Surveille les mutations Firestore via onSnapshot
 * - Met à jour le statut en temps réel
 */
export function useSyncStatus(): UseSyncStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(new Date());

  // Surveillance des collections Firestore via onSnapshot
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [menuItemsCount, setMenuItemsCount] = useState<number>(0);
  const [tablesCount, setTablesCount] = useState<number>(0);
  const [reservationsCount, setReservationsCount] = useState<number>(0);

  // Détection online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Surveillance des collections Firestore
  useEffect(() => {
    const ordersRef = collection(getDb(), 'orders');
    const menuItemsRef = collection(getDb(), 'menuItems');
    const tablesRef = collection(getDb(), 'restaurantTables');
    const reservationsRef = collection(getDb(), 'reservations');

    const unsubscribeOrders = onSnapshot(
      ordersRef,
      (snapshot) => {
        setOrdersCount(snapshot.size);
      },
      (error) => {
        console.error('[useSyncStatus] Error monitoring orders:', error);
      }
    );

    const unsubscribeMenuItems = onSnapshot(
      menuItemsRef,
      (snapshot) => {
        setMenuItemsCount(snapshot.size);
      },
      (error) => {
        console.error('[useSyncStatus] Error monitoring menuItems:', error);
      }
    );

    const unsubscribeTables = onSnapshot(
      tablesRef,
      (snapshot) => {
        setTablesCount(snapshot.size);
      },
      (error) => {
        console.error('[useSyncStatus] Error monitoring tables:', error);
      }
    );

    const unsubscribeReservations = onSnapshot(
      reservationsRef,
      (snapshot) => {
        setReservationsCount(snapshot.size);
      },
      (error) => {
        console.error('[useSyncStatus] Error monitoring reservations:', error);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeMenuItems();
      unsubscribeTables();
      unsubscribeReservations();
    };
  }, []);

  // Surveillance des mutations (quand un count change, on update lastSync)
  useEffect(() => {
    // Cette effet se déclenche à chaque changement de count
    const timer = setTimeout(() => {
      setLastSync(new Date());
    }, 100);

    return () => clearTimeout(timer);
  }, [ordersCount, menuItemsCount, tablesCount, reservationsCount]);

  // Détermination du statut
  const status: SyncStatus = isOnline ? 'connected' : 'disconnected';

  // lastMutationAt est la même que lastSync pour cette implémentation
  const lastMutationAt = lastSync;

  return {
    status,
    isOnline,
    lastSync,
    lastMutationAt,
  };
}

/**
 * Hook simplifié pour obtenir uniquement le statut
 */
export function useSyncStatusSimple(): SyncStatus {
  const { status } = useSyncStatus();
  return status;
}
