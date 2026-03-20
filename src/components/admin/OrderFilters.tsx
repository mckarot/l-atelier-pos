// src/components/admin/OrderFilters.tsx
// Filtres et barre de recherche pour la vue Live Orders

import { type JSX, useCallback } from 'react';
import type { OrderStatus } from '../../db/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderFiltersProps {
  /** Statut sélectionné pour le filtre */
  selectedStatus: OrderStatus | 'all';
  /** Callback quand le statut change */
  onStatusChange: (status: OrderStatus | 'all') => void;
  /** Texte de recherche actuel */
  searchQuery: string;
  /** Callback quand la recherche change */
  onSearchChange: (query: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Toutes les commandes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'pret', label: 'Prêt' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composant de filtres pour la vue Live Orders
 * Permet de filtrer par statut et de rechercher une commande
 */
export function OrderFilters({
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: OrderFiltersProps): JSX.Element {
  // Gestionnaire de changement de statut
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onStatusChange(e.target.value as OrderStatus | 'all');
    },
    [onStatusChange]
  );

  // Gestionnaire de changement de recherche
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 mb-6"
      role="search"
      aria-label="Filtres des commandes"
    >
      {/* Filtre par statut */}
      <div className="flex-1">
        <label
          htmlFor="status-filter"
          className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2"
        >
          Statut
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={handleStatusChange}
          className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface font-label text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
          aria-describedby="status-filter-desc"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span id="status-filter-desc" className="sr-only">
          Filtrer les commandes par statut
        </span>
      </div>

      {/* Barre de recherche */}
      <div className="flex-1">
        <label
          htmlFor="order-search"
          className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2"
        >
          Rechercher
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-sm"
            aria-hidden="true"
          >
            search
          </span>
          <input
            id="order-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="N° commande, table, client..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface font-label text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
            aria-describedby="search-desc"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 hover:text-on-surface text-sm cursor-pointer"
              aria-label="Effacer la recherche"
              type="button"
            >
              close
            </button>
          )}
        </div>
        <span id="search-desc" className="sr-only">
          Rechercher une commande par numéro, table ou nom de client
        </span>
      </div>
    </div>
  );
}

export default OrderFilters;
