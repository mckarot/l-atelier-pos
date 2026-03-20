// src/views/KDS/components/KDSFooter.tsx
// Footer technique du KDS avec statistiques

import { type JSX, useEffect, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/database';
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Temps moyen de préparation (en minutes)
  const avgPrepTime = useLiveQuery<number>(
    async () => {
      const completedOrders = await db.orders
        .where('status')
        .anyOf(['pret', 'servi', 'paye'])
        .toArray();

      if (completedOrders.length === 0) return 0;

      const totalTime = completedOrders.reduce((sum, order) => {
        const prepTime = (order.updatedAt || 0) - order.createdAt;
        return sum + prepTime;
      }, 0);

      return Math.round(totalTime / completedOrders.length / 60000);
    },
    []
  );

  // Nombre de commandes actives
  const activeOrdersCount = useLiveQuery<number>(
    () =>
      db.orders
        .where('status')
        .anyOf(['en_attente', 'en_preparation', 'pret'])
        .count(),
    []
  );

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
    () => (activeOrdersCount || 0).toString(),
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
