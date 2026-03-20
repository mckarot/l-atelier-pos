// src/views/KDS/components/KDSHeader.tsx
// Header du KDS avec compteur LIVE et horloge

import { type JSX, useEffect, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/database';
import { formatTime } from '../../../utils/timer';
import { cn } from '../../../utils/cn';

export interface KDSHeaderProps {
  /** Titre principal du KDS */
  title?: string;
  /** Affiche l'indicateur de connexion serveur */
  showConnectionIndicator?: boolean;
}

/**
 * Header du KDS avec:
 * - Titre de la vue
 * - Indicateur de connexion serveur
 * - Horloge temps réel
 * - Compteur LIVE des commandes actives
 */
export function KDSHeader({
  title = 'Écran de Production Cuisine',
  showConnectionIndicator = true,
}: KDSHeaderProps): JSX.Element {
  // Horloge temps réel
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Compteur de commandes actives
  const activeOrdersCount = useLiveQuery<number>(
    () =>
      db.orders
        .where('status')
        .anyOf(['en_attente', 'en_preparation', 'pret'])
        .count(),
    []
  );

  // Formatage mémorisé
  const formattedTime = useMemo(
    () => formatTime(currentTime),
    [currentTime]
  );

  const formattedCount = useMemo(
    () => (activeOrdersCount || 0).toString().padStart(2, '0'),
    [activeOrdersCount]
  );

  return (
    <header
      className="h-16 flex justify-between items-center px-8 bg-surface sticky top-0 z-30 border-b border-outline-variant/10"
      role="banner"
    >
      {/* Section gauche: Titre */}
      <div className="flex items-center gap-4">
        <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-primary">
          {title}
        </h2>
        {/* Compteur LIVE */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm font-bold',
            'bg-surface-container-high text-on-surface',
            'transition-all duration-300',
            activeOrdersCount && activeOrdersCount > 0 && 'animate-pulse'
          )}
          role="status"
          aria-label={`${activeOrdersCount} commandes actives`}
          aria-live="polite"
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              activeOrdersCount && activeOrdersCount > 0
                ? 'bg-tertiary'
                : 'bg-on-surface-variant'
            )}
            aria-hidden="true"
          />
          <span className="text-on-surface/60 text-xs uppercase tracking-widest mr-1">
            LIVE
          </span>
          <span className="text-primary">{formattedCount}</span>
        </div>
      </div>

      {/* Section droite: Indicateurs */}
      <div className="flex items-center gap-6">
        {showConnectionIndicator && (
          <div
            className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded text-xs font-mono"
            role="status"
            aria-label="Serveur connecté"
          >
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            Serveur Connecté
          </div>
        )}
        <div
          className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded text-sm font-mono text-on-surface-variant"
          role="timer"
          aria-label={`Heure actuelle: ${formattedTime}`}
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            schedule
          </span>
          {formattedTime}
        </div>
      </div>
    </header>
  );
}

export default KDSHeader;
