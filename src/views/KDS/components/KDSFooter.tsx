// src/views/KDS/components/KDSFooter.tsx
// Footer technique du KDS avec statistiques

import { type JSX, useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, type Timestamp } from 'firebase/firestore';
import { getDb } from '../../../firebase/config';
import { formatTime } from '../../../utils/timer';
import { cn } from '../../../utils/cn';

export interface KDSFooterProps {
  /** Affiche l'heure de dernière synchro */
  showLastSync?: boolean;
}

/**
 * Footer technique du KDS avec:
 * - Temps moyen de préparation
 * - Nombre total de commandes actives
 * - Heure de dernière synchro (optionnelle)
 */
export function KDSFooter({
  showLastSync = true,
}: KDSFooterProps): JSX.Element {
  // Horloge pour la dernière synchro
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [avgPrepTime, setAvgPrepTime] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Temps moyen de préparation (en minutes) et nombre de commandes actives
  useEffect(() => {
    const ordersRef = collection(getDb(), 'orders');

    // Subscribe to active orders count
    const activeQuery = query(
      ordersRef,
      where('status', 'in', ['attente', 'preparation', 'pret'])
    );

    const unsubscribeActive = onSnapshot(
      activeQuery,
      (snapshot) => {
        setActiveOrdersCount(snapshot.size);
      },
      (error) => {
        console.error('[KDSFooter] Error monitoring active orders:', error);
      }
    );

    // Subscribe to completed orders for avg prep time calculation
    const completedQuery = query(
      ordersRef,
      where('status', 'in', ['pret', 'served', 'paid'])
    );

    const unsubscribeCompleted = onSnapshot(
      completedQuery,
      (snapshot) => {
        if (snapshot.size === 0) {
          setAvgPrepTime(0);
          return;
        }

        const orders = snapshot.docs.map(doc => doc.data() as {
          createdAt: Timestamp;
          updatedAt?: Timestamp;
        });

        const totalTime = orders.reduce((sum, order) => {
          const createdAt = order.createdAt.toMillis();
          const updatedAt = order.updatedAt?.toMillis() || createdAt;
          const prepTime = updatedAt - createdAt;
          return sum + prepTime;
        }, 0);

        const avgTimeMs = totalTime / orders.length;
        const avgTimeMinutes = Math.round(avgTimeMs / 60000);
        setAvgPrepTime(avgTimeMinutes);
      },
      (error) => {
        console.error('[KDSFooter] Error monitoring completed orders:', error);
      }
    );

    return () => {
      unsubscribeActive();
      unsubscribeCompleted();
    };
  }, []);

  // Formatages mémorisés
  const formattedLastSync = useMemo(
    () => formatTime(currentTime),
    [currentTime]
  );

  const formattedAvgTime = useMemo(
    () => (avgPrepTime || 0).toString(),
    [avgPrepTime]
  );

  const formattedCount = useMemo(
    () => activeOrdersCount.toString(),
    [activeOrdersCount]
  );

  return (
    <footer
      className="h-12 bg-surface-container-lowest flex items-center px-8 justify-between border-t border-outline-variant/5"
      role="contentinfo"
    >
      {/* Statistiques */}
      <div className="flex gap-8 items-center text-[10px] font-bold uppercase tracking-tighter">
        <div className="flex items-center gap-2">
          <span className="text-on-surface/40">Temps moyen:</span>
          <span
            className={cn(
              'font-mono',
              avgPrepTime > 20 ? 'text-error' : 'text-tertiary'
            )}
            role="status"
            aria-label={`Temps moyen de préparation: ${formattedAvgTime} minutes`}
          >
            {formattedAvgTime}m
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-on-surface/40">Total:</span>
          <span
            className="text-primary font-mono"
            role="status"
            aria-label={`${formattedCount} commandes actives`}
            aria-live="polite"
          >
            {formattedCount}
          </span>
        </div>
      </div>

      {/* Dernière synchro */}
      {showLastSync && (
        <div
          className="text-[10px] font-mono text-on-surface/30"
          role="status"
          aria-label={`Dernière synchro: ${formattedLastSync}`}
          aria-live="polite"
        >
          DERNIÈRE SYNCHRO: {formattedLastSync}
        </div>
      )}
    </footer>
  );
}

export default KDSFooter;
