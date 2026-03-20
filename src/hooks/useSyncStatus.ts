// src/hooks/useSyncStatus.ts
// Hook personnalisé pour détecter l'état de synchronisation et la connexion réseau

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

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
 * - Surveille les mutations Dexie via lastSync
 * - Met à jour le statut en temps réel
 */
export function useSyncStatus(): UseSyncStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(new Date());

  // Surveillance des mutations via une requête qui se met à jour
  // On utilise le comptage des tables comme proxy de mutation
  const ordersCount = useLiveQuery<number>(() => db.orders.count(), []);
  const menuItemsCount = useLiveQuery<number>(() => db.menuItems.count(), []);
  const tablesCount = useLiveQuery<number>(() => db.restaurantTables.count(), []);
  const reservationsCount = useLiveQuery<number>(() => db.reservations.count(), []);

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
