// src/components/admin/TableCard.tsx
// Carte individuelle pour une table active dans la section "Services Actifs"

import type { TableService, TableServiceItem } from '../../hooks/useActiveTables';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TableCardProps {
  /** Données de la table */
  service: TableService;
  /** Classe CSS personnalisée */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Couleurs de bordure gauche selon le statut */
const BORDER_COLORS: Record<TableService['status'], string> = {
  retard: 'border-error',
  en_preparation: 'border-tertiary',
  nouveau: 'border-primary',
};

/** Couleurs de badge selon le statut */
const BADGE_COLORS: Record<TableService['status'], string> = {
  retard: 'bg-error/20 text-error',
  en_preparation: 'bg-tertiary/10 text-tertiary',
  nouveau: 'bg-primary/10 text-primary',
};

/** Labels de statut affichés */
const STATUS_LABELS: Record<TableService['status'], string> = {
  retard: 'RETARD',
  en_preparation: 'EN PRÉPARATION',
  nouveau: 'NOUVEAU',
};

/** Couleurs de texte pour le statut des items */
const ITEM_STATUS_COLORS: Record<TableServiceItem['status'], string> = {
  retard: 'text-error',
  pret: 'text-tertiary',
  preparation: 'text-primary',
  attente: 'text-on-surface-variant',
};

/** Labels de statut des items */
const ITEM_STATUS_LABELS: Record<TableServiceItem['status'], string> = {
  attente: 'ATTENTE',
  pret: 'PRÊT',
  preparation: 'EN CUISINE',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carte de table individuelle pour la section "Services Actifs"
 *
 * Design system conforme aux maquettes PNG:
 * - Fond: bg-surface-container
 * - Largeur: ~350px
 * - Bordure gauche: border-l-4 avec couleur selon statut
 * - Numéro commande: font-mono text-lg font-bold text-primary
 * - Badge statut: bg-tertiary/10 text-tertiary ou bg-error/20 text-error
 * - Items: liste avec quantité en text-primary font-bold
 * - Statut items: texte coloré à droite
 * - Temps d'attente: font-mono
 * - Total: font-mono font-bold
 */
export function TableCard({ service, className = '' }: TableCardProps): JSX.Element {
  // Formater le total en euros
  const formatTotal = (total: number): string => {
    return `${total.toFixed(2)} €`;
  };

  // Obtenir la couleur de texte pour le temps d'attente
  const getWaitTimeColor = (status: TableService['status'], waitTime: number): string => {
    if (status === 'retard') return 'text-error';
    if (waitTime > 15) return 'text-error';
    return 'text-on-surface-variant';
  };

  return (
    <div
      className={`flex flex-col w-[350px] rounded-xl border border-outline-variant/10 bg-surface-container border-l-4 ${BORDER_COLORS[service.status]} ${className}`}
      role="article"
      aria-label={`Commande ${service.orderId} - ${service.tableName}`}
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between p-4 border-b border-outline-variant/10">
        {/* Numéro de commande */}
        <div>
          <p className="font-mono text-lg font-bold text-primary">
            #{service.orderId}
          </p>

          {/* Badge de statut */}
          <span
            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${BADGE_COLORS[service.status]}`}
          >
            {service.status === 'retard' && (
              <span
                className="material-symbols-outlined text-xs"
                aria-hidden="true"
              >
                warning
              </span>
            )}
            {STATUS_LABELS[service.status]}
          </span>
        </div>

        {/* Nom de la table */}
        <div className="text-right">
          <p className="font-headline font-bold text-lg text-on-surface">
            {service.tableName}
          </p>
        </div>
      </div>

      {/* Informations sur le service */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-variant/30">
        {/* Nombre de personnes */}
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-on-surface-variant text-sm"
            aria-hidden="true"
          >
            people
          </span>
          <span className="font-label text-sm text-on-surface-variant">
            {service.guests} Personnes
          </span>
        </div>

        {/* Serveur */}
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-on-surface-variant text-sm"
            aria-hidden="true"
          >
            person
          </span>
          <span className="font-label text-sm text-on-surface-variant">
            Serveur: {service.server}
          </span>
        </div>
      </div>

      {/* Liste des items */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '200px' }}>
        {service.items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-start justify-between gap-2"
          >
            {/* Quantité et nom de l'item */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="font-mono font-bold text-primary flex-shrink-0">
                {item.quantity}x
              </span>
              <span className="font-label text-sm text-on-surface truncate">
                {item.name}
              </span>
            </div>

            {/* Statut de l'item */}
            <span
              className={`flex-shrink-0 font-label text-xs font-bold uppercase ${ITEM_STATUS_COLORS[item.status]}`}
            >
              {ITEM_STATUS_LABELS[item.status]}
            </span>
          </div>
        ))}

        {service.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant text-2xl mb-2"
              aria-hidden="true"
            >
              restaurant
            </span>
            <p className="font-label text-sm text-on-surface-variant">
              Aucun item
            </p>
          </div>
        )}
      </div>

      {/* Pied de carte - Temps d'attente et total */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10 bg-surface-variant/30">
        {/* Temps d'attente */}
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-sm ${getWaitTimeColor(service.status, service.waitTime)}`}
            aria-hidden="true"
          >
            schedule
          </span>
          <span
            className={`font-mono font-bold ${getWaitTimeColor(service.status, service.waitTime)}`}
          >
            {service.waitTime}min
          </span>
        </div>

        {/* Total */}
        <div className="flex items-center gap-1">
          <span className="font-label text-xs text-on-surface-variant">
            Total:
          </span>
          <span className="font-mono font-bold text-primary">
            {formatTotal(service.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
