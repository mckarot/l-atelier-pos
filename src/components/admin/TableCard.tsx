// src/components/admin/TableCard.tsx
// Carte individuelle pour une table active

import type { TableRecord } from '../../firebase/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TableCardProps {
  /** Données de la table */
  table: TableRecord;
  /** Classe CSS personnalisée */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Couleurs de bordure gauche selon le statut */
const BORDER_COLORS: Record<TableRecord['status'], string> = {
  libre: 'border-outline-variant',
  occupee: 'border-tertiary',
  reservation: 'border-primary',
  maintenance: 'border-error',
};

/** Couleurs de badge selon le statut */
const BADGE_COLORS: Record<TableRecord['status'], string> = {
  libre: 'bg-surface-container-highest text-on-surface-variant',
  occupee: 'bg-tertiary/10 text-tertiary',
  reservation: 'bg-primary/10 text-primary',
  maintenance: 'bg-error/20 text-error',
};

/** Labels de statut affichés */
const STATUS_LABELS: Record<TableRecord['status'], string> = {
  libre: 'LIBRE',
  occupee: 'OCCUPÉE',
  reservation: 'RÉSERVÉE',
  maintenance: 'MAINTENANCE',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carte de table individuelle pour la section "Services Actifs"
 */
export function TableCard({ table, className = '' }: TableCardProps): JSX.Element {
  return (
    <div
      className={`flex flex-col w-[350px] rounded-xl border border-outline-variant/10 bg-surface-container border-l-4 ${BORDER_COLORS[table.status]} ${className}`}
      role="article"
      aria-label={`Table ${table.name}`}
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between p-4 border-b border-outline-variant/10">
        {/* Nom de la table */}
        <div>
          <p className="font-headline font-bold text-lg text-on-surface">
            {table.name}
          </p>

          {/* Badge de statut */}
          <span
            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${BADGE_COLORS[table.status]}`}
          >
            {table.status === 'maintenance' && (
              <span
                className="material-symbols-outlined text-xs"
                aria-hidden="true"
              >
                warning
              </span>
            )}
            {STATUS_LABELS[table.status]}
          </span>
        </div>

        {/* Capacité */}
        {table.capacity && (
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
            >
              people
            </span>
            <span className="font-mono text-sm">{table.capacity}</span>
          </div>
        )}
      </div>

      {/* Informations sur la table */}
      <div className="flex-1 p-4">
        {table.currentOrderId && (
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-on-surface-variant text-sm"
              aria-hidden="true"
            >
              receipt_long
            </span>
            <span className="font-label text-sm text-on-surface-variant">
              Commande: #{table.currentOrderId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableCard;
