// src/components/ui/Timer.tsx
// Composant Timer avec seuils d'alerte pour le KDS

import { useEffect, useState, useMemo, type JSX } from 'react';
import {
  calculateElapsedTime,
  formatElapsedTime,
  getTimerAlertStatus,
  type TimerAlertStatus,
} from '../../utils/timer';
import { cn } from '../../utils/cn';

export interface TimerProps {
  /** Timestamp de création de la commande */
  createdAt: number;
  /** Classe CSS supplémentaire */
  className?: string;
  /** Affiche le temps depuis le début (par défaut: temps écoulé) */
  showElapsedOnly?: boolean;
  /** Callback optionnel lorsque le timer change de statut */
  onStatusChange?: (status: TimerAlertStatus) => void;
}

/**
 * Timer KDS avec mise à jour en temps réel et seuils d'alerte
 * Affiche le temps écoulé au format MM:SS avec coloration sémantique
 */
export function Timer({
  createdAt,
  className,
  showElapsedOnly = false,
  onStatusChange,
}: TimerProps): JSX.Element {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Mise à jour du timer chaque seconde
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Calculs mémorisés
  const elapsedMs = useMemo(
    () => calculateElapsedTime(createdAt, currentTime),
    [createdAt, currentTime]
  );

  const formattedTime = useMemo(
    () => formatElapsedTime(elapsedMs),
    [elapsedMs]
  );

  const alertStatus = useMemo(
    () => getTimerAlertStatus(elapsedMs),
    [elapsedMs]
  );

  // Notification de changement de statut
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(alertStatus);
    }
  }, [alertStatus, onStatusChange]);

  // Classes dynamiques selon le statut
  const statusClasses: Record<TimerAlertStatus, string> = {
    normal: 'text-on-surface',
    warning: 'text-secondary animate-pulse',
    danger: 'text-error animate-pulse',
  };

  return (
    <div
      className={cn('flex flex-col items-end', className)}
      role="status"
      aria-label={`Temps écoulé: ${formattedTime}`}
      aria-live="polite"
    >
      <span
        className={cn(
          'font-mono text-xl font-bold transition-colors',
          statusClasses[alertStatus]
        )}
      >
        {formattedTime}
      </span>
    </div>
  );
}

export default Timer;
