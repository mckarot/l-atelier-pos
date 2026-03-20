// src/components/admin/KPICard.tsx
// Composant réutilisable pour les cartes KPI du dashboard

import { useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface KPICardProps {
  /** Titre de la carte (ex: "Revenu Quotidien") */
  title: string;
  /** Valeur principale affichée (ex: "2 485 €") */
  value: string;
  /** Label de variation (ex: "+12% VS HIER") */
  variationLabel?: string;
  /** Type de variation pour le style du badge */
  variationType?: 'positive' | 'negative' | 'neutral';
  /** Information secondaire (ex: "OBJECTIF: 15:00") */
  secondaryInfo?: string;
  /** Icône Material Symbols optionnelle */
  icon?: string;
  /** Classe CSS personnalisée */
  className?: string;
  /** Aria-label pour l'accessibilité */
  ariaLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carte KPI réutilisable pour le dashboard administrateur
 * 
 * Design system:
 * - Fond: bg-surface-container
 * - Padding: p-6
 * - Titre: font-label text-xs uppercase tracking-widest text-on-surface-variant
 * - Valeur: font-headline text-5xl font-bold text-primary
 * - Badge: bg-tertiary/10 text-tertiary text-xs font-bold px-2 py-1 rounded
 */
export function KPICard({
  title,
  value,
  variationLabel,
  variationType = 'neutral',
  secondaryInfo,
  icon,
  className = '',
  ariaLabel,
}: KPICardProps): JSX.Element {
  // Mémoïser les classes de variation pour éviter les recalculs
  const variationClasses = useMemo(() => {
    switch (variationType) {
      case 'positive':
        return 'bg-tertiary/10 text-tertiary';
      case 'negative':
        return 'bg-error/10 text-error';
      case 'neutral':
      default:
        return 'bg-surface-variant/50 text-on-surface-variant';
    }
  }, [variationType]);

  return (
    <div
      className={`rounded-xl border border-outline-variant/10 bg-surface-container p-6 ${className}`}
      role="region"
      aria-label={ariaLabel || title}
    >
      {/* En-tête avec titre et icône */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          {title}
        </h3>
        {icon && (
          <span
            className="material-symbols-outlined text-on-surface-variant text-lg"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Valeur principale */}
      <div className="flex items-baseline gap-2">
        <p className="font-headline text-4xl font-bold text-primary">
          {value}
        </p>
      </div>

      {/* Variation et info secondaire */}
      <div className="mt-4 flex items-center gap-2">
        {variationLabel && (
          <span
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${variationClasses}`}
          >
            {variationType === 'positive' && (
              <span className="material-symbols-outlined text-xs" aria-hidden="true">
                trending_up
              </span>
            )}
            {variationType === 'negative' && (
              <span className="material-symbols-outlined text-xs" aria-hidden="true">
                trending_down
              </span>
            )}
            {variationLabel}
          </span>
        )}
        
        {secondaryInfo && (
          <span className="font-label text-xs text-on-surface-variant">
            {secondaryInfo}
          </span>
        )}
      </div>
    </div>
  );
}

export default KPICard;
