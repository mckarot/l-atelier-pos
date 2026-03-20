// src/views/KDS/components/KDSColumn.tsx
// Colonne générique pour le board KDS

import { type JSX, type ReactNode, useMemo } from 'react';
import { cn } from '../../../utils/cn';

export interface KDSColumnProps {
  /** Titre de la colonne */
  title: string;
  /** Couleur du point indicateur (classe Tailwind) */
  indicatorColor?: string;
  /** Couleur du texte du titre (classe Tailwind) */
  titleColor?: string;
  /** Nombre de commandes dans la colonne */
  count: number;
  /** Contenu de la colonne (liste des OrderCard) */
  children: ReactNode;
  /** Message à afficher quand la colonne est vide */
  emptyMessage?: string;
  /** Temps moyen de préparation en minutes (optionnel, affiché dans le header) */
  averageTimeMinutes?: number;
  /** Classe CSS supplémentaire */
  className?: string;
}

/**
 * Colonne générique pour le board KDS
 * Contient l'en-tête avec compteur + badge moyenne, le corps avec les commandes
 */
export function KDSColumn({
  title,
  indicatorColor = 'bg-amber-500',
  titleColor = 'text-on-surface',
  count,
  children,
  emptyMessage = 'Aucune commande',
  averageTimeMinutes,
  className,
}: KDSColumnProps): JSX.Element {
  // Formatage du compteur avec padding
  const formattedCount = useMemo(
    () => count.toString().padStart(2, '0'),
    [count]
  );

  return (
    <section
      className={cn(
        'flex flex-col h-full bg-surface-container-low rounded-xl overflow-hidden shadow-2xl',
        className
      )}
      aria-label={`Colonne: ${title}`}
    >
      {/* En-tête de colonne avec compteur et badge moyenne */}
      <header className="flex-shrink-0 p-4 border-b border-outline-variant/10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-1 h-1 rounded-full ${indicatorColor}`} />
              <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface/40">
                {title}
              </h2>
            </div>
            <p className="text-2xl font-black leading-none">{String(count).padStart(2, '0')}</p>
          </div>
          {averageTimeMinutes !== undefined && (
            <span className="bg-primary/10 text-primary font-mono text-xs font-bold px-2 py-1 rounded">
              MOY: {averageTimeMinutes} MIN
            </span>
          )}
        </div>
      </header>

      {/* Corps de colonne */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {count === 0 ? (
          <div
            className="text-center py-8 text-on-surface-variant/40"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default KDSColumn;
