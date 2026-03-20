// src/components/admin/ActiveServices.tsx
// Section "Services Actifs" avec toggle Cuisine/Service et cartes de tables

import { useState, useMemo } from 'react';
import { TableCard } from './TableCard';
import { useActiveTables, type TableService } from '../../hooks/useActiveTables';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceView = 'cuisine' | 'service';

export interface ActiveServicesProps {
  /** Titre de la section */
  title?: string;
  /** Sous-titre de la section */
  subtitle?: string;
  /** Classe CSS personnalisée */
  className?: string;
  /** Nombre maximum de cartes à afficher */
  maxCards?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Labels pour le toggle */
const TOGGLE_LABELS: Record<ServiceView, string> = {
  cuisine: 'Cuisine',
  service: 'Service',
};

/** Couleurs du toggle */
const TOGGLE_COLORS: Record<ServiceView, string> = {
  cuisine: 'bg-tertiary text-on-tertiary',
  service: 'bg-secondary text-on-secondary',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Section "Services Actifs" avec toggle Cuisine/Service
 *
 * Design system conforme aux maquettes PNG:
 * - Titre: "Services Actifs" + sous-titre
 * - Toggle: "Cuisine" (vert) + "Service" (orange)
 * - Layout: 3 cartes côte à côte (~350px chacune)
 * - Cartes triées par statut (retard en premier)
 */
export function ActiveServices({
  title = 'Services Actifs',
  subtitle = 'Vue d\'ensemble des tables et commandes en cours',
  className = '',
  maxCards = 6,
}: ActiveServicesProps): JSX.Element {
  // État du toggle (Cuisine par défaut)
  const [activeView, setActiveView] = useState<ServiceView>('cuisine');

  // Récupérer les tables actives
  const tables = useActiveTables();

  // Filtrer les tables selon la vue active
  const filteredTables = useMemo(() => {
    if (!tables) return [];

    // Pour la vue "Cuisine", on montre toutes les tables actives
    // Pour la vue "Service", on pourrait filtrer uniquement les tables prêtes à servir
    // Ici on montre toutes les tables pour les deux vues (à adapter selon les besoins)
    if (activeView === 'cuisine') {
      return tables.slice(0, maxCards);
    }

    // Vue Service: montrer les tables avec items prêts ou en retard
    const serviceTables = tables.filter(
      t => t.status === 'retard' || t.items.some(i => i.status === 'pret')
    );
    return serviceTables.slice(0, maxCards);
  }, [tables, activeView, maxCards]);

  // Compter les tables en retard
  const retardCount = useMemo(() => {
    if (!tables) return 0;
    return tables.filter(t => t.status === 'retard').length;
  }, [tables]);

  return (
    <div
      className={`rounded-xl border border-outline-variant/10 bg-surface-container p-6 ${className}`}
      role="region"
      aria-label={title}
    >
      {/* En-tête avec titre et toggle */}
      <div className="flex items-center justify-between mb-6">
        {/* Titre et sous-titre */}
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">
            {title}
          </h3>
          <p className="font-label text-sm text-on-surface-variant mt-1">
            {subtitle}
          </p>
        </div>

        {/* Toggle Cuisine/Service */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg bg-surface-variant/50"
          role="group"
          aria-label="Filtre de vue"
        >
          {Object.entries(TOGGLE_LABELS).map(([view, label]) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view as ServiceView)}
                className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? TOGGLE_COLORS[view as ServiceView]
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
                aria-pressed={isActive}
                aria-label={`Vue ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicateur de retard */}
      {retardCount > 0 && (
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-error/10"
          role="alert"
          aria-label={`${retardCount} table(s) en retard`}
        >
          <span
            className="material-symbols-outlined text-error text-sm"
            aria-hidden="true"
          >
            warning
          </span>
          <span className="font-label text-sm font-bold text-error">
            {retardCount} table(s) en retard
          </span>
        </div>
      )}

      {/* Grille de cartes */}
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        role="list"
        aria-label="Tables actives"
      >
        {filteredTables.length > 0 ? (
          filteredTables.map(service => (
            <TableCard key={service.orderId} service={service} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-12 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant text-4xl mb-4"
              aria-hidden="true"
            >
              restaurant
            </span>
            <p className="font-headline text-lg font-semibold text-on-surface">
              Aucun service en cours
            </p>
            <p className="font-label text-sm text-on-surface-variant mt-1">
              Les tables actives apparaîtront ici
            </p>
          </div>
        )}
      </div>

      {/* Indicateur de scroll si plus de cartes */}
      {tables && tables.length > maxCards && (
        <div className="flex items-center justify-center gap-2 mt-4 text-on-surface-variant">
          <span className="font-label text-xs">
            {tables.length - maxCards} autre(s) table(s)
          </span>
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </div>
      )}
    </div>
  );
}

export default ActiveServices;
