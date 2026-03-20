// src/components/admin/LiveFeed.tsx
// Composant Timeline pour le flux live d'activités

import type { LiveEvent } from '../../hooks/useDashboardData';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveFeedProps {
  /** Événements du flux live */
  events: LiveEvent[];
  /** Titre du flux */
  title?: string;
  /** Texte du lien "Voir tout" */
  viewAllText?: string;
  /** Handler pour le clic sur "Voir tout" */
  onViewAll?: () => void;
  /** Classe CSS personnalisée */
  className?: string;
  /** Nombre maximum d'événements à afficher */
  maxEvents?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline du flux live d'activités
 * 
 * Design system:
 * - Titre: "Flux Live"
 * - Items: 3-4 événements avec icône dans cercle coloré
 * - Lien "VOIR TOUT L'HISTORIQUE" en bas
 */
export function LiveFeed({
  events,
  title = 'Flux Live',
  viewAllText = 'VOIR TOUT L\'HISTORIQUE',
  onViewAll,
  className = '',
  maxEvents = 4,
}: LiveFeedProps): JSX.Element {
  // Formater le montant en euros
  const formatAmount = (amount?: number): string => {
    if (amount === undefined) return '';
    return `${amount.toFixed(2)} €`;
  };

  // Obtenir la couleur de fond pour l'icône basée sur le type d'événement
  const getIconBgColor = (type: LiveEvent['type'], color: string): string => {
    // Mapping des couleurs pour les fonds d'icônes
    if (color.includes('tertiary')) return 'bg-tertiary/10';
    if (color.includes('error')) return 'bg-error/10';
    if (color.includes('primary')) return 'bg-primary/10';
    return 'bg-surface-variant/50';
  };

  // Limiter le nombre d'événements affichés
  const displayedEvents = events.slice(0, maxEvents);

  return (
    <div
      className={`rounded-xl border border-outline-variant/10 bg-surface-container p-6 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          {title}
        </h3>
        <span
          className="material-symbols-outlined text-on-surface-variant text-lg"
          aria-hidden="true"
        >
          realtime
        </span>
      </div>

      {/* Timeline des événements */}
      <div className="space-y-4" role="list" aria-label="Événements récents">
        {displayedEvents.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-3"
            role="listitem"
            aria-label={event.title}
          >
            {/* Ligne verticale de la timeline */}
            {index < displayedEvents.length - 1 && (
              <div
                className="absolute w-px h-12 bg-outline-variant/20"
                style={{ marginLeft: '15px' }}
                aria-hidden="true"
              />
            )}

            {/* Icône dans un cercle coloré */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor(event.type, event.color)}`}
              aria-hidden="true"
            >
              <span
                className={`material-symbols-outlined text-sm ${event.color}`}
              >
                {event.icon}
              </span>
            </div>

            {/* Contenu de l'événement */}
            <div className="flex-1 min-w-0">
              <p className="font-label text-sm font-medium text-on-surface truncate">
                {event.title}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                {event.amount !== undefined && (
                  <span className="font-headline text-sm font-bold text-primary">
                    {formatAmount(event.amount)}
                  </span>
                )}
                <span className="font-label text-xs text-on-surface-variant">
                  {event.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}

        {displayedEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant text-4xl mb-2"
              aria-hidden="true"
            >
              notifications_none
            </span>
            <p className="font-label text-sm text-on-surface-variant">
              Aucun événement récent
            </p>
          </div>
        )}
      </div>

      {/* Lien "Voir tout" */}
      {events.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors"
          aria-label="Voir tout l'historique des événements"
        >
          {viewAllText}
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </button>
      )}
    </div>
  );
}

export default LiveFeed;
